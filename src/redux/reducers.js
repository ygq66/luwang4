export default function reducer(state, action) {
  switch (action.type) {
    case "simple": {
      return {...state, ...action}
    }
    default:
      return state
  }
}