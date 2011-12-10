/**
 * @author timknip
 * translated to javascript by @staunsholm
 */

var JSBlender = JSBlender || {};

JSBlender.BlendFile = function()
{
    /**
     * BlendFileHeader
     */
    this.header = null;

    /**
     * Array
     */
    this.blocks = null;

    /**
     * DNARepository
     */
    this.dna = null;

    /**
     * Array
     */
    this.scenes;

    var _blockByPointer;
    var _readPointers;
    var _pointerData;

    /**
     * returns a BHeadStruct
     */
    this.getBlockByPointer = function(pointer)
    {
        return _blockByPointer[pointer];
    }

    /**
     * returns an Array
     */
    this.getBlocksByDNA = function(dnaIndex)
    {
        var result = new Array();
        var block;
        for (var i = 0, l = this.blocks.length; i < l; i++)
        {
            block = this.blocks[i];
            if (block.sdnaIndex == dnaIndex)
            {
                result.push(block);
            }
        }
        return result;
    }

    /**
     * data is a ByteArray
     */
    this.read = function(data)
    {
        data.position = 0;

        this.header = new JSBlender.BlendFileHeader(data);

        _blockByPointer = new Object();
        _pointerData = new Object();
        _readPointers = new Object();

        this.readBlocks(data);
        this.readDNA(data);

        this.scenes = this.readType(data, "Scene");
    }

    /**
     * returns an array of type blocks
     */
    this.readType = function(data, type)
    {
        var struct = this.dna.getStructByType(type);
        var blocks = this.getBlocksByDNA(struct.index);
        var result = new Array();
        var i, l;

        for (i = 0,l = blocks.length; i < l; i++)
        {
            result.push(this.readBlock(data, blocks[i]));
        }

        return result;
    }

    /**
     * Read all block headers
     */
    this.readBlocks = function(data)
    {
        var block = new JSBlender.BHeadStruct(data, this.header.pointerSize, this.header.charSet);

        this.blocks = new Array();

        while (block.code != "ENDB")
        {
            this.blocks.push(block);
            _blockByPointer[block.pointer] = block;
            data.position += block.size;
            block = new JSBlender.BHeadStruct(data, this.header.pointerSize, this.header.charSet);
        }
    }

    /**
     *
     */
    this.readDNA = function(data)
    {
        var dnaBlock = this.getSdnaBlock();
        if (dnaBlock)
        {
            data.position = dnaBlock.position;
            this.dna = new JSBlender.DNARepository(data, this.header);
        }
    }

    /**
     *
     */
    this.readCharArray = function(data)
    {
        var s = "";
        var i, l;
        for (i = 0,l = data.length; i < l; i++)
        {
            if (data[i] == 0)
            {
                break;
            }
            s += String.fromCharCode(data[i]);
        }

        return s;
    }

    /**
     *
     */
    this.readPointer = function(data)
    {
        var s = "" + data.readInt();
        if (this.header.pointerSize > 4)
        {
            s += data.readInt();
        }
        return s;
    }

    this.readBlock = function(data, block)
    {
        var struct = this.dna.structs[block.sdnaIndex];
        var result = new Object();
        var i;

        data.position = block.position;

        result = block.count > 1 ? new Array(block.count) : new Object();

        for (i = 0; i < block.count; i++)
        {
            if (block.count > 1)
            {
                result[i] = this.readStruct(data, struct);
            }
            else
            {
                result = this.readStruct(data, struct);
            }
        }

        return result;
    }

    this.readStruct = function(data, struct)
    {
        var field;
        var result = new Object();

        //console.log(indent+dna.types[struct.type]);

        for (var i = 0, l = struct.fields.length; i < l; i++)
        {
            field = struct.fields[i];
            this.readField(data, field, result);
        }

        return result;
    }

    /**
     *
     */
    this.readField = function(data, field, object)
    {
        var shortName = field.getShortName();

        if (field.getIsPointer())
        {
            var pointer = this.readPointer(data);

            if (pointer != "0" && !_readPointers[pointer])
            {
                _readPointers[pointer] = 1;
                object[shortName] = _pointerData[pointer] = this.dereferencePointer(data, pointer);
            }
            else
            {
                object[shortName] = _pointerData[pointer];
            }
        } else if (field.getIsSimpleType())
        {
            var instance = new JSBlender.DNAFieldInstance(field, this.header.pointerSize);
            var value = instance.read(data);

            if (field.type == "char" && field.getShortName() == "name" && field.getIsArray())
            {
                object[shortName] = this.readCharArray(value);
            }
            else if (value)
            {
                object[shortName] = value.length == 1 ? value[0] : value;
            }
        }
        else
        {
            var struct = this.dna.getStructByType(field.type);
            if (struct)
            {
                object[shortName] = this.readStruct(data, struct);
            }
            else
            {
                data.position += field.length;
            }
        }
    }

    /**
     *
     */
    this.dereferencePointer = function(data, pointer)
    {
        var position = data.position;
        var block = this.getBlockByPointer(pointer);
        var result = new Object();

        if (block)
        {
            result = this.readBlock(data, block);
        }

        data.position = position;

        return result;
    }

    /**
     *
     */
    this.getSdnaBlock = function()
    {
        var block;

        for (var i = 0, l = this.blocks.length; i < l; i++)
        {
            block = this.blocks[i];
            if (block.code == "DNA1")
            {
                return block;
            }
        }

        return null;
    }
}

JSBlender.BlendFile.load = function(url, callback)
{
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);

    xhr.responseType = 'arraybuffer';

    xhr.onload = function(e)
    {
        if (this.status == 200)
        {
            callback(new JSBlender.ByteArray(this.response));
        }
        else
        {
            // some error
            console.log("Loading '" + url + "' failed");
        }
    }

    xhr.send();
}