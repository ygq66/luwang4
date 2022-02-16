import settingService from "./settingService";
import axios from "axios";
import React from 'react'

let mapAdminApiService = {
  getCatchImg() {

  },
  getAuthorization() {
    return React.$store.getState().authorization;
  },
  searchRoutes() {
    let auth = mapAdminApiService.getAuthorization();
    let rootUrl = settingService.getSetting('rootUrl').value
    return new Promise(resolve => {
      axios({
        url: `${rootUrl}/shortestpath/data/search?key=`,
        method: 'get',
        headers: {
          Authorization: auth,
        }
      }).then(res => {
        if (res.code === 200) {
          resolve(res.data)
        } else {
          console.error('请求失败', res)
        }
      })
    })
  }
}

export default mapAdminApiService;