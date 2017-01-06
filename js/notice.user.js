[
  {
    "type": "start",
    "wait": "60",
  },
  {
    "type": "get",
    "iframeselector": "",
    "datas": [
      {
        "selector": "strong",
        "column": "新列",
        "from": "text",
        "iframeselector": ""
      },
    {
        "selector": "div.container.relative > ul.clear-fix.no-style-list > li.header-main-nav-item:nth-child(3) > a.header-main-nav-link",
        "column": "新列",
        "from": "text",
        "iframeselector": ""
      }
    ]
  },
  {
    "type": "liststart",
    "selector": "ul#noticeList > li",
    "maxpage":"2,",
    "pageselector":"",
    "iframeselector":""
  },
  {
    "type": "get",
    "datas": [
      {
        "selector": " div.about-list-content  >  div.about-list-heading ",
        "column": "新列",
        "from": "text",
        "iframeselector": "",
        "opentab":[
                      {
                          "selector": "div#noticeDetailWrapper > h4",
                          "column": "新列",
                          "from": "text",
                          "iframeselector": ""
                      },
                      {
                          "selector": "div#noticeDetailWrapper > p",
                          "column": "新列",
                          "from": "text",
                          "iframeselector": ""
                      },
                      {
                          "selector": "div.information-notice-detail-content",
                          "column": "新列",
                          "from": "text",
                          "iframeselector": ""
                      }
                ]
      },
      {
        "selector": " div.about-list-content  >  p:nth-child(2) ",
        "column": "新列",
        "from": "text",
        "iframeselector": ""
      },
      {
        "selector": " div.about-list-content  >  p:nth-child(3)  >  span.pull-right ",
        "column": "新列",
        "from": "text",
        "iframeselector": ""
      }
    ]
  },
  {
    "type": "listend"
  },
  {
    "type": "pageend"
  },
  {
    "type": "end"
  }
]