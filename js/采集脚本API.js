{
    "type": "start",
    "wait": "60",
}

{
    "type": "end"
}

{
    "type": "click",
	"selector":"",
	"wait":"2",
	"iframeselector":""
}


{
    "type": "get",
	"iframeselector":"",
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
  }
  
  
{
    "type": "list",
    "selector": "ul#noticeList > li",
    "maxpage":"2,",
    "pageselector":"",
    "iframeselector":"",
	"action":[get]
}  
