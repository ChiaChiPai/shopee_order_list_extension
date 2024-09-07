# 蝦皮 api
## 清單索引
[POST]

postData = {
  "mass_shipment_tab": 301,
  "filter": {
    "is_single_item": 0,
    "shipping_document_type": 0,
    "pre_order": 2,
    "shipping_priority": 0,
    "product_location_ids": [
      ""
    ],
    "ofg_process_status": 0
  },
  "pagination": {
    "from_page_number": 1,
    "page_number": 1,
    "page_size": 50
  },
  "sort": {
    "sort_type": 2,
    "ascending": true
  },
  "entity_type": 1,
  "current_time": 1725634421
}
https://seller.shopee.tw/api/v3/order/search_mass_shipment_index?SPC_CDS=ac4ca4df-81b1-4aa8-b827-0d1a0ffbd2c6&SPC_CDS_VER=2

## 總訂單清單
[POST]
query = SPC_CDS=ac4ca4df-81b1-4aa8-b827-0d1a0ffbd2c6&SPC_CDS_VER=2
postData = {
  "mass_shipment_tab": 301,
  "package_number_list": [
    {
      "package_number": "OFG178955775274516",
      "region_id": "TW",
      "shop_id": 7832473
    },
    ....
  ]
}

https://seller.shopee.tw/api/v3/order/get_mass_shipment_card_list?SPC_CDS=ac4ca4df-81b1-4aa8-b827-0d1a0ffbd2c6&SPC_CDS_VER=2

- order_id：data.group_card_list[0].package_card_list[0].ext_info.order_id


- order_sn：data.group_card_list[0].package_card_list[0].basic_info.order_sn
- 買家帳號：data.group_card_list[0].package_card_list[0].basic_info.buyer_username
- 交貨便代碼：data.group_card_list[0].package_card_list[0].fulfillment_info.third_party_tn
- 圖片：https://cf.shopee.tw/file/ +data.group_card_list[0].package_card_list[0].item_info.item_list[0].first_image

===


## 買家訂單資訊
[GET]
query = SPC_CDS=ac4ca4df-81b1-4aa8-b827-0d1a0ffbd2c6&SPC_CDS_VER=2&order_id=179244358227810

https://seller.shopee.tw/api/v3/order/get_one_order?SPC_CDS=ac4ca4df-81b1-4aa8-b827-0d1a0ffbd2c6&SPC_CDS_VER=2&order_id=179244358227810

- 便利商店：data.actual_carrier
- 買家姓名：data.buyer_user.user_name
- 商品圖片：data.order_items[0].product.images[0]
- 規格：data.order_items[0].item_model.name
- 貨號(方便辨識)：data.order_items[0].item_model.sku
- 數量：data.order_items[0].amount
- 總數：data.order_items[0].amount 加總所有 order_items 的 amount
- 備註：data.remark

===
## 頁數
https://seller.shopee.tw/api/v3/order/search_mass_shipment_index?SPC_CDS=ac4ca4df-81b1-4aa8-b827-0d1a0ffbd2c6&SPC_CDS_VER=2

===
## 貨運對應代碼
https://seller.shopee.tw/api/v3/logistics/get_channel_display_name?SPC_CDS=ac4ca4df-81b1-4aa8-b827-0d1a0ffbd2c6&SPC_CDS_VER=2

===