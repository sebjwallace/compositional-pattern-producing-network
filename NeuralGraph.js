
var ng = {}

class NgNode{

    constructor(inputs,callback){
        this.inputs = inputs
        this.key = Math.random()
        this.observers = []
        this.dependencies = {}
        this.passed = false
        this.callback = callback || function(){}

        for(var i in inputs){
            inputs[i].observe(this)
            this.dependencies[inputs[i].key] = false
        }
    }

    observe(observer){
        this.observers.push(observer)
    }

    pass(key){
        if(!this.passed){
            this.passed = true
            for(var i in this.observers)
                this.observers[i].fill(key)
        }
    }

    fill(key){
        this.dependencies[key] = true
        var filled = true
        for(var i in this.dependencies)
            if(!this.dependencies[i])
                filled = false
        if(filled){
            var value = this.compute()
            this.callback(value)
            this.pass(this.key)
        }
    }

    compute(){
        // override this method
    }

}

ng.node = {

    constant: class extends NgNode{

        constructor(input){
            super([],null)
            this.value = input
        }

        compute(){
            return this.value
        }

    },

    add: class extends NgNode{

        constructor(inputs,callback){
            super(inputs,callback)
        }

        compute(){
            return this.inputs.reduce(function(t,n){
                return t + n.compute()
            },0)
        }

    },

    subtract: class extends NgNode{

        constructor(inputs,callback){
            super(inputs,callback)
        }

        compute(){
            return this.inputs.reduce(function(t,n){
                return t + n.compute()
            },0)
        }

    },

    multiply: class extends NgNode{

        constructor(inputs,callback){
            super(inputs,callback)
        }

        compute(){
            return this.inputs.reduce(function(t,n){
                return t * n.compute()
            },0)
        }

    },

    binary: class extends NgNode{

        constructor(inputs,callback){
            super(inputs,callback)
        }

        compute(){
            return this.inputs[0].compute() >= 1 ? 1 : 0
        }

    },

    linear: class extends NgNode{

        constructor(inputs,callback){
            super(inputs,callback)
        }

        compute(){
            return this.inputs[0].compute()
        }

    },

    sin: class extends NgNode{

        constructor(inputs,callback){
            super(inputs,callback)
        }

        compute(){
            return Math.sin(this.inputs[0].compute())
        }

    },

    cos: class extends NgNode{

        constructor(inputs,callback){
            super(inputs,callback)
        }

        compute(){
            return Math.cos(this.inputs[0].compute())
        }

    },

    tanh: class extends NgNode{

        constructor(inputs,callback){
            super(inputs,callback)
        }

        compute(){
            return Math.tanh(this.inputs[0].compute())
        }

    },

    sigmoid: class extends NgNode{

        constructor(inputs,callback){
            super(inputs,callback)
        }

        compute(){
            return 1/(1+Math.pow(Math.E, -this.inputs[0].compute()))
        }

    },

    bipolarSigmoid: class extends NgNode{

        constructor(inputs,callback){
            super(inputs,callback)
        }

        compute(){
            return (2.0 / (1.0 + Math.exp(-4.9 * this.inputs[0].compute()))) - 1.0
        }

    },

    guassian: class extends NgNode{

        constructor(inputs,callback){
            super(inputs,callback)
        }

        compute(){
            return 2 * Math.exp(-Math.pow(this.inputs[0].compute() * 2.5, 2)) - 1
        }

    },

    rectifier: class extends NgNode{

        constructor(inputs,callback){
            super(inputs,callback)
        }

        compute(){
            var v = this.inputs[0].compute()
            return v >= 1 ? v : 0
        }

    },

    invert: class extends NgNode{

        constructor(inputs,callback){
            super(inputs,callback)
        }

        compute(){
            return -(this.inputs[0].compute())
        }

    },

    weight: class extends NgNode{

        constructor(input,weight,callback){
            super([input],callback)
            this.weight = weight
        }

        compute(){
            return this.inputs[0].compute() * this.weight
        }

    },

    neuron: class extends NgNode{

        constructor(inputs,activation,callback){
            for(var i in inputs)
                inputs[i] = new ng.node.weight(inputs[i],1)
            inputs = [new ng.node[activation]([new ng.node.add(inputs)])]
            super(inputs,callback)
        }

        compute(){
            return this.inputs[0].compute()
        }

    }

}

ng.network = {

    perceptron: class {

        constructor(numInputs){
            this.inputs = []
            for(var i = 0; i < numInputs; i++)
                this.inputs[i] = new ng.node.neuron()
        }

    }

}


var a = new ng.node.constant(4)
var b = new ng.node.constant(5)
var c = new ng.node.constant(2)
var e = new ng.node.neuron([a,b,c],'sigmoid',function(val){
    console.log(val)
})

a.fill()
b.fill()
c.fill()
