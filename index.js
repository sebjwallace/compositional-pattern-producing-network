
var net = new ng.network.cppn(2,3)

var canvas = document.getElementById('canvas')
var ctx = canvas.getContext('2d')

// for(var y = 0; y < 256; y++){
//     for(var x = 0; x < 256; x++){
//         var output = net.feedforward([x,y])
//         ctx.fillStyle = 'rgb('+(output[0]*100)+','+(output[1]*100)+','+(output[2]*100)+')'
//         ctx.fillRect(x,y,1,1)
//     }
// }
