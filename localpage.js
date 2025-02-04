const urlQuery = 'SPC_CDS=a44aeb4c-7738-46b6-b7a3-a39ad1d4f426&SPC_CDS_VER=2'
main()

async function main () {
  const packageParamList = await getPackageNumber()
  const orderList = await getOrderIDList(packageParamList)
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

async function getOrderIDList(package_param_list) {
  return $.ajax({
    type: 'POST',
    async: true,
    url: `https://seller.shopee.tw/api/v3/order/get_mass_shipment_card_list_v2?${urlQuery}`,
    contentType: 'application/json',
    data: JSON.stringify({
      mass_shipment_tab: 301,
      need_count_down_desc: false,
      package_param_list: package_param_list.slice(0, 50)
    })
  }).done(function (data) {
    return data;
  }).then(data => {
    if (data.code === 0) {
      return  data.data.card_list.map(item => {
        return {
          thirdPartyTNList: item.package_group_card.package_card_list[0].fulfilment_info.tracking_number,
          orderID: item.package_group_card.package_card_list[0].ext_info.order_id
        }
      }).filter(item => item.thirdPartyTNList)
    } else {
      throw new Error(`Can not get order id list, code: ${data.code}`)
    }
  }).catch(err => {
    console.error(`Get order id list error: ${err}`)
  })
}

async function fetchData(orderID, thirdPartyTNList) {
  const response = await fetch(`https://seller.shopee.tw/api/v3/order/get_one_order?order_id=${orderID}&${urlQuery}`);
  const data = await response.json();
  return {...data, thirdPartyTNList};
}

function checkTimeFormat(time) {
  return time < 10 ? `0${time}` : time
}

async function renderOrder(orderList) {
  console.log('orderList', orderList)
  const ordersWithShippingTime = await orderList.map(async({orderID, thirdPartyTNList}) => {
    const response = await fetchData(orderID, thirdPartyTNList)
    return response
  })
  const resolvedOrders = await Promise.all(ordersWithShippingTime)
  const sortedOrders = resolvedOrders
    .map(item => ({...item.data, thirdPartyTNList: item.thirdPartyTNList}))
    .sort((a, b) => a.shipping_confirm_time - b.shipping_confirm_time)

  sortedOrders.forEach((item, index) => {
    const {
      order_id,
      actual_carrier,
      remark,
      buyer_user,
      order_items,
      shipping_confirm_time,
      thirdPartyTNList
    } = item
    let total = 0
    const time = new Date(shipping_confirm_time * 1000)
    $('#content').append(`
      <tr id="${order_id}" class="order_item">
        <td>${index + 1}</td>
        <td>${thirdPartyTNList}</td>
        <td>${actual_carrier}</td>
        <td>${buyer_user.user_name}</td>
        <td class="product"></td>
        <td class="product_amount"></td>
        <td class="product_total"></td>
        <td>${time.getMonth()+1}/${time.getDate()} ${checkTimeFormat(time.getHours())}:${checkTimeFormat(time.getMinutes())}:${checkTimeFormat(time.getSeconds())}</td>
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
  })
}