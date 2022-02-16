let d3Service = {
  svgSelected: null,

  svgItemGroup: {},
  svgItemId: 0,

  // 获取id
  getKey(fileBuild, fileFloor) {
    return `${fileBuild}_${fileFloor}`
  },
  addIdToGroup(key) {
    let id = `${key}_${this.svgItemId++}`
    if (key in this.svgItemGroup) {
      this.svgItemGroup[key].push(id);
      return id;
    } else {
      this.svgItemGroup[key] = [id];
      return id;
    }
  },

  drawPoint(d3Obj, point, r = 5, key = "") {
    let circle = d3Obj.append('circle')

    circle
      .style("fill", "blue")
      .attr('cx', point[0])
      .attr('cy', point[1])
      .attr('r', r)
      .attr('id', d3Service.addIdToGroup(key))

    circle.append('animate').attr("attributeName", "fill")
      .attr('attributeType', 'XML')
      .attr('begin', 'red')
      .attr('to', 'transparent')
      .attr('dur', '0.5s') // 秒数太小时看不出渐变的效果，不知道啥原因？？？而且渐变就第一次点击有效果，不知道为啥？？？
      .attr('fill', 'remove')
      .attr('repeatCount', 'indefinite')

    return circle
  },
  drawTextCheck(d3Obj, point, key = "") {
    return d3Obj.append("text")
      .text('错误')
      .attr("text-anchor", "left") // 字体尾部对齐
      .attr("x", point[0])
      .attr("y", point[1])
      .attr('id', d3Service.addIdToGroup(key))
  },
  drawLine(d3Obj, arr, color = 'green', key = "") {
    let lineFunction = window.d3.line()
      .x(function (d) { return d[0]; })
      .y(function (d) { return d[1]; });

    let path = d3Obj.append('path').attr('d', lineFunction(arr))
      .attr('stroke', color)
      .attr('stroke-width', 1)
      .attr('fill', 'none')
      .attr('id', d3Service.addIdToGroup(key))
    path.append('animate').attr("attributeName", "stroke")
      .attr('attributeType', 'XML')
      .attr('begin', 'yellow')
      .attr('to', 'transparent')
      .attr('dur', '0.5s') // 秒数太小时看不出渐变的效果，不知道啥原因？？？而且渐变就第一次点击有效果，不知道为啥？？？
      .attr('fill', 'remove')
      .attr('repeatCount', 'indefinite')
    return path;
  },
  // 绘制文字
  drawText(d3Obj, txt, point, textAnchor = 'start', id = "") {
    return d3Obj.append("text")
      .text(txt)
      .attr("text-anchor", textAnchor) // 字体尾部对齐
      .attr("x", point[0])
      .attr("y", point[1])
      .attr("id", id)
  },
  drawOriginPoint(g) {
    g.append('circle')
      .style("fill", "blue")
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 5)
    g.append('circle')
      .style("fill", "blue")
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 8)
  },
}
export default d3Service;