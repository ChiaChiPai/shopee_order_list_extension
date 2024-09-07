const urlQuery = 'SPC_CDS=ac4ca4df-81b1-4aa8-b827-0d1a0ffbd2c6&SPC_CDS_VER=2'
main()

async function main () {
  const packageNumberList = await getPackageNumber()
  const orderList = await getOrderIDList(packageNumberList)
  renderOrder(orderList)
}

async function getPackageNumber() {
  return $.ajax({
    type: 'POST',
    async: true,
    url: `https://seller.shopee.tw/api/v3/order/search_mass_shipment_index?${urlQuery}`,
    contentType: 'application/json',
    data: JSON.stringify({
      mass_shipment_tab: 301,
      current_time: Math.floor(Date.now() / 1000),
      filter: {
        is_single_item: 0,
        is_drop_off: 0,
        shipping_document_type: 0,
        pre_order: 2,
        shipping_priority: 0,
        product_location_ids: [""],
        ofg_process_status: 2
      },
      pagination: {
        from_page_number: 1,
        page_number: 1,
        page_size: 200
      },
      sort: { sort_type: 2, ascending: true },
      entity_type: 1
    })
  }).done(function (data) {
    return data;
  }).then(data => {
    if (data.code === 0) {
      const packageNumberList = data.data.index_list
      return packageNumberList
    } else {
      throw new Error(`Can not get package number, code: ${data.code}`)
    }
  }).catch(err => {
    console.error(`Get package number error: ${err}`)
  })
}

async function getOrderIDList(package_number_list) {
  return $.ajax({
    type: 'POST',
    async: true,
    url: `https://seller.shopee.tw/api/v3/order/get_mass_shipment_card_list?${urlQuery}`,
    contentType: 'application/json',
    data: JSON.stringify({
      mass_shipment_tab: 301,
      package_number_list
    })
  }).done(function (data) {
    return data;
  }).then(data => {
    if (data.code === 0) {
      return  data.data.group_card_list.map(item => {
        return {
          thirdPartyTNList: item.package_card_list[0].fulfillment_info.third_party_tn,
          orderID: item.package_card_list[0].ext_info.order_id
        }
      })
    } else {
      throw new Error(`Can not get order id list, code: ${data.code}`)
    }
  }).catch(err => {
    console.error(`Get order id list error: ${err}`)
  })
}

function renderOrder(orderList) {
  orderList.forEach(({orderID, thirdPartyTNList}, index) => {
    $.ajax({
      type: 'GET',
      async: false,
      url: `https://seller.shopee.tw/api/v3/order/get_one_order?order_id=${orderID}&${urlQuery}`,
    }).done(function (data) {
      if(data.code === 0) {
        const {
          order_id,
          actual_carrier,
          remark,
          buyer_user,
          order_items,
        } = data.data
        let total = 0
        $('#content').append(`
          <tr id="${order_id}" class="order_item">
            <td>${index + 1}</td>
            <td>${thirdPartyTNList}</td>
            <td>${actual_carrier}</td>
            <td>${buyer_user.user_name}</td>
            <td class="product"></td>
            <td class="product_amount"></td>
            <td class="product_total"></td>
            <td>${remark}</td>
          </tr>
        `)

        order_items.forEach(info => {
          $(`#${order_id} .product`).append(`
            <div class="product_item">
              <div>
                <img with="100" height="100" src="https://cf.shopee.tw/file/${info.product.images[0]}" alt="">
              </div>
              <div style="text-align: left">
                <div style="border-bottom: 1px solid #000">${info.item_model.sku}</div>
                <div>${info.item_model.name}</div>
              </div>
            </div>
          `)
          $(`#${order_id} .product_amount`).append(`<div class="amount_block">${info.amount}</div`)
          total += info.amount;
          $(`#${order_id} .product_total`).text(`${total}雙`)
        })

        if(total > 1) {
          $(`#${order_id}.order_item`).addClass('bolder')
          $(`#${order_id}.order_item .product_total`).addClass('red')
        }
      } else {
        throw new Error(`Can not get order detail, code: ${data.code}`)
      }
    }).catch(err => {
      console.error(`Get order detail error: ${err}`)
    })
  })
}