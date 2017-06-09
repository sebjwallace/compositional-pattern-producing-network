
class NGNode{

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

class NGConstant extends NGNode{

    constructor(input){
        super([],null)
        this.value = input
    }

    compute(){
        return this.value
    }

}

class NGWeight extends NGNode{

    constructor(input,weight,callback){
        super([input],callback)
        this.weight = weight
    }

    compute(){
        return this.inputs[0].compute() * this.weight
    }

}

class NGSum extends NGNode{

    constructor(inputs,callback){
        super(inputs,callback)
    }

    compute(){
        return this.inputs.reduce(function(t,n){
            return t + n.compute()
        },0)
    }

}

var a = new NGConstant(4)
var b = new NGConstant(5)
var c = new NGConstant(2)
var d = new NGSum([a,b])
var e = new NGSum([c,d],function(val){
    console.log(val)
})

a.fill()
b.fill()
c.fill()
