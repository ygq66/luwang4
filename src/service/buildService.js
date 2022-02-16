import utils from "../utils/untils";

let buildService = {
  getBuilds(map, success) {
    map.GetBuildingNames(success)
  },
  getFloors(map, buildName, success) {
    setTimeout(() => {
      map.GetFloorNames(buildName, success)
    }, 200)
  },
  getFloorsAsync(map, buildName) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        map.GetFloorNames(buildName, success => {
          resolve(success)
        })
      }, 200);
    })
  },

}

export default buildService;