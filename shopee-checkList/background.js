

let api_list = []
chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    api_list.push(details.url)
    // chrome.storage.sync.set({apiList : details.url}, function(){})
    // chrome.tabs.create({ url: chrome.runtime.getURL("localpage.html") });
  },
  // filter
  {
    urls: [
        "https://seller.shopee.tw/api/v3/order/get_shipment_order_list_by_order_ids_multi_shop*",
        "https://seller.shopee.tw/api/v3/order/get_package_list*",
    ],
  },
)


setTimeout(() => {
  chrome.storage.sync.set({apiList : api_list}, function(){})
},10000)


