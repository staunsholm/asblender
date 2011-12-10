/**
 * A BHeadStruct is the Blender internal's name of a blend-file-header.
 * It contains information on how to parse the next data-section.
 *
 * @author timknip
 * translated to javascript by @staunsholm
 */

var JSBlender = JSBlender || {};

JSBlender.BHeadStruct = function(data, pointerSize, charSet)
{
    /**
     *
     */
    this.code = null;

    /**
     *
     */
    this.size = null;

    /**
     *
     */
    this.sdnaIndex = null;

    /**
     *
     */
    this.count = null;

    /**
     *
     */
    this.position = null;

    /**
     *
     */
    this.pointer = null;

    /**
     * constructor code
     */
    if (!pointerSize)
    {
        pointerSize = 4;
    }
    if (!charSet)
    {
        charSet = "iso-8859-1";
    }

    this.code = data.readMultiByte(4, charSet);
    this.size = data.readInt();
    this.pointer = "" + data.readInt();
    if (pointerSize != 4)
    {
        this.pointer += "" + data.readInt();
    }
    this.sdnaIndex = data.readInt();
    this.count = data.readInt();
    this.position = data.position;
};
