chrome.storage.sync.get('apiList',function(data){
  console.log(data.apiList);
  let package = data.apiList.filter(url => url.indexOf('get_package_list') != -1)
  let shipment = data.apiList.filter(url => url.indexOf('get_shipment_order_list_by_order_ids_multi_shop') != -1)

  console.log('package', package);
  console.log('shipment', shipment);

  $.ajax({
    type: 'GET',
    async: true,
    url: package[0] || 'https://seller.shopee.tw/api/v3/order/get_package_list?SPC_CDS=dbc10b2b-1188-41fd-a877-cacbdcef6b69&SPC_CDS_VER=2&source=processed&page_size=40&page_number=1&total=0&sort_by=confirmed_date_desc',
  }).done(function (data) {
    return data;
  }).then(data => {
    if(data.code === 0) {
      let package_list = data.data.package_list.reverse();
      package_list.forEach((item, index) => {
        const sJson = JSON.stringify({ 
          orders: [{order_id: item.order_id, region_id: item.region_id, shop_id: item.shop_id}]
        });
        $.ajax({
          type: 'POST',
          async: false,
          contentType : 'application/json;charset=UTF-8',
          url: shipment[0] || 'https://seller.shopee.tw/api/v3/order/get_shipment_order_list_by_order_ids_multi_shop?SPC_CDS=dbc10b2b-1188-41fd-a877-cacbdcef6b69&SPC_CDS_VER=2',
          data: sJson
        }).done(function (data) {
          const order = data.data.orders[0]
          if(data.code === 0) {
            let total = 0;

            $('#content').append(`
              <tr id="${item.order_id}" class="order_item">
                <td>${index+1}</td>
                <td>${item.third_party_tn}</td>
                <td>${item.carrier_name}</td>
                <td>${order.buyer_address_name}</td>
                <td class="product"></td>
                <td class="product_amount"></td>
                <td class="product_total"></td>
                <td>${order.remark}</td>
              </tr>
            `);

            order.order_items.forEach(info => {
              $(`#${item.order_id} .product`).append(`
                <div class="product_item">
                  <div>
                    <img with="100" height="100" src="https://cf.shopee.tw/file/${info.product.images[0]}" alt="">
                  </div>
                  <div>${info.product.sku}</div>
                  <div>\| ${info.item_model.name}</div>
                </div>
              `)
              $(`#${item.order_id} .product_amount`).append(`<div class="amount_block">${info.amount}</div`)
              total += info.amount;
              $(`#${item.order_id} .product_total`).text(`${total}雙`)
            })
          }
        })
      })

    }
  })

});