"""智能客服可调用的工具集，当前包含「订单查询」。

安全约定：所有查询都必须以 user_id 作为过滤条件，
该 user_id 由 Node 后端校验 JWT 后传入，绝不信任前端直接提交的值。
"""

from typing import Optional

from db import get_connection

ORDER_STATUS = {
    0: "待支付",
    1: "已支付（待发货）",
    2: "已发货",
    3: "已完成",
    4: "已关闭",
    5: "退款中",
    6: "已退款",
}

PAY_TYPE = {1: "支付宝", 2: "微信"}


def _fmt_time(value) -> str:
    return value.strftime("%Y-%m-%d %H:%M") if value else ""


def query_user_orders(
    user_id: int,
    limit: int = 5,
    order_no: Optional[str] = None,
) -> str:
    """查询指定用户的订单，返回可直接交给大模型组织的文本摘要。

    :param user_id: 用户ID（必填，用于数据隔离）
    :param limit: 未指定订单号时，返回最近多少笔订单
    :param order_no: 指定订单号时精确查询该订单
    """
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            sql = """
                SELECT id, order_no, total_amount, pay_amount, order_status,
                       pay_type, receiver_name, receiver_phone, receiver_full_address,
                       create_time, pay_time, delivery_time, receive_time
                FROM `orders`
                WHERE user_id = %s
            """
            params = [user_id]

            if order_no:
                sql += " AND order_no = %s"
                params.append(order_no)

            sql += " ORDER BY create_time DESC LIMIT %s"
            params.append(limit)

            cursor.execute(sql, params)
            orders = cursor.fetchall()

            if not orders:
                return "未查询到该用户的订单记录。"

            # 查询这些订单的商品明细
            order_ids = [o["id"] for o in orders]
            placeholders = ", ".join(["%s"] * len(order_ids))
            cursor.execute(
                f"""
                SELECT os.order_id, oi.good_name, oi.quantity, oi.good_price
                FROM order_shop os
                JOIN order_item oi ON oi.order_shop_id = os.id
                WHERE os.order_id IN ({placeholders})
                """,
                order_ids,
            )
            items = cursor.fetchall()
    finally:
        conn.close()

    # 按订单聚合商品
    item_map = {}
    for it in items:
        item_map.setdefault(it["order_id"], []).append(it)

    lines = [f"共查询到 {len(orders)} 笔订单："]
    for idx, o in enumerate(orders, 1):
        goods = item_map.get(o["id"], [])
        goods_desc = "、".join(
            f'{g["good_name"]} x{g["quantity"]}' for g in goods
        ) or "（无商品明细）"

        lines.append(
            f"{idx}. 订单号 {o['order_no']}\n"
            f"   状态：{ORDER_STATUS.get(o['order_status'], '未知状态')}\n"
            f"   下单时间：{_fmt_time(o['create_time'])}\n"
            f"   实付金额：￥{o['pay_amount']}\n"
            f"   支付方式：{PAY_TYPE.get(o['pay_type'], '未知')}\n"
            f"   收货人：{o['receiver_name']} {o['receiver_phone']}\n"
            f"   收货地址：{o['receiver_full_address']}\n"
            f"   商品：{goods_desc}\n"
            f"   发货时间：{_fmt_time(o['delivery_time']) or '未发货'}"
        )

    return "\n".join(lines)
