function createClass() {
    var _toString = Object.prototype.toString,
        childArr = Array.prototype.slice.call(arguments),
        base = _toString.call(childArr[0]) === '[object Function]' ? childArr.shift() : Object;

    function argumentNames(body) {
        var names = body.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1].replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '').replace(/\s+/g, '').split(',');
        return names.length == 1 && !names[0] ? [] : names;
    }

    function overrideMethod(childMethod, superMethod) {
        var method = function() {
                var childScope = this;
                var $super = (superMethod !== undefined) ?
                function() {
                    return superMethod.apply(childScope, arguments);
                } : undefined;
                var args = Array.prototype.slice.apply(arguments);
                args.unshift($super);
                return childMethod.apply(childScope, args);
            };
        return method;
    }

    var childObj = childArr[0],
        properties = Object.keys(childObj),
        i, len, p, value;
    for (i = 0, len = properties.length; i < len; i++) {
        p = properties[i];
        value = childObj[p];
        if(childObj.hasOwnProperty(p)) {
            if(_toString.call(value) === '[object Function]') {
                if(argumentNames(value)[0] == '$super') {
                    value = overrideMethod(value, base.prototype[p]);
                }
            }
            childObj[p] = {
                value: value,
                enumerable: true,
                writable: true
            };
        }
    }

    function klass() {
        if(this instanceof klass) {
           klass.prototype.init.apply(this, arguments);
        } else {
           throw new Error('klass cannot be called as a function.');
        }
    }

    klass._super_ = base.prototype;
    klass.prototype = Object.create(base.prototype, childObj);
    Object.defineProperty(klass.prototype, 'constructor', {
        value: klass,
        enumerable: false
    });

    if(klass.prototype.init === undefined || klass.prototype.init === null) {
        klass.prototype.init = function() {};
    }
    return klass;
}