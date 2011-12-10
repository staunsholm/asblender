/**
 * ByteArray.js by @staunsholm
 */

var JSBlender = JSBlender || {};

JSBlender.ByteArray = function(data)
{
    // constants
    JSBlender.ByteArray.ENDIAN_BIG = "V";
    JSBlender.ByteArray.ENDIAN_LITTLE = "v";

    // public variables
    this.position = 0;
    this.endian = JSBlender.ByteArray.ENDIAN_BIG;

    // constructor
    var uInt8Array = new Uint8Array(data);
    var int8Array = new Int8Array(data);
    var uInt16Array = new Uint16Array(data);
    var int16Array = new Int16Array(data);
    //var uInt32Array = new Uint32Array(data);
    var int32Array = new Int32Array(data);
    var float32Array = new Float32Array(data);
    var float64Array = new Float64Array(data);

    this.readMultiByte = function(length, charset)
    {
        var string = "";
        for (var i = 0; i < length; i++)
        {
            string += String.fromCharCode(uInt8Array[this.position]);
            this.position++;
        }
        return string;
    };

    this.readInt = function()
    {
        var i = int32Array[this.position>>2];
        this.position += 4;
        return i;
    };

    this.readByte = function()
    {
        var i = int8Array[this.position];
        this.position += 1;
        return i;
    };

    this.readUnsignedByte = function()
    {
        var i = uInt8Array[this.position];
        this.position += 1;
        return i;
    };

    this.readShort = function()
    {
        var i = int16Array[this.position >> 1];
        this.position += 2;
        return i;
    };

    this.readUnsignedShort = function()
    {
        var i = uInt16Array[this.position >> 1];
        this.position += 2;
        return i;
    };

    this.readFloat = function()
    {
        var i = float32Array[this.position >> 2];
        this.position += 4;
        return i;
    };

    this.readDouble = function()
    {
        var i = float64Array[this.position >> 3];
        this.position += 8;
        return i;
    };
};