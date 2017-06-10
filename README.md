# neural-graph
graph computation library

```javascript

   // sample graph

   var a = ng.node.constant(2)
   var b = ng.node.constant(4)
   var c = ng.node.multiply([a,b])
   var d = ng.node.add([a,c],function(value){
      // when all input nodes have been computed d will compute
      console.log(value)
      // > 10
   })
   
   a.fill()
   b.fill()
```
