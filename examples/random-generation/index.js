const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.width = canvas.height = 100;
document.body.appendChild(canvas);

const net = new ng.network.cppn(3+3,3);
net.insertRandomNode();
net.insertRandomNode();
net.insertRandomNode();
net.insertRandomNode();
net.insertRandomNode();

let prev = Array.from({length:canvas.height},() => {
    return Array.from({length:canvas.height}, () => [0,0,0])
});

setInterval(() => {

    const next = [];

    for(var y = 0; y < canvas.height; y++){
        next[y] = [];
        for(var x = 0; x < canvas.width; x++){
            var center = canvas.height / 2
            var dx = Math.abs(center - x)
            var dy = Math.abs(center - y)
            var dist = Math.sqrt(dx*dx + dy*dy)
            var output = net.feedforward([
                x/10,
                y/10,
                dist/50,
                prev[y][x][0],
                prev[y][x][1],
                prev[y][x][2]
            ])
            var r = parseInt(255 * (output[0] || 0))
            var g = parseInt(255 * (output[1] || 0))
            var b = parseInt(255 * (output[2] || 0))
            next[y][x] = output;
            ctx.fillStyle = 'rgb('+r+','+g+','+b+')'
            ctx.fillRect(x,y,1,1)
        }
    }

    prev = next;

}, 200)