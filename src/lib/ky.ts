import ky from "ky"

const kyInstance = ky.create({
  parseJson(text) {
    return JSON.parse(text, (key, val) => {
      if (key.endsWith("At")) return new Date(val)
      return val
    })
  },
})

export default kyInstance
