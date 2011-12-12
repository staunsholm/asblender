/**
 * @author timknip
 * translated to javascript by @staunsholm
 */

var JSBlenderTest = JSBlenderTest || {};

JSBlenderTest.Main = function(url, data)
{
    var outputDiv = document.getElementById('output');
    var outputText = "";
    var startTime = new Date().getTime();

    if (data !== undefined)
    {
        init(new JSBlender.ByteArray(data));
    }
    else
    {
        //JSBlender.BlendFile.load('src/assets/tiefighterlowtriang.blend', init);
        //JSBlender.BlendFile.load('src/assets/threecubes.blend', init);
        JSBlender.BlendFile.load(url, init);
        //JSBlender.BlendFile.load('src/assets/crystal_cube.blend', init);
    }

    function init(blenderData)
    {
        var blend = new JSBlender.BlendFile();

        blend.read(blenderData);
        // Uncomment the following line to trace out the complete DNA
        //printDNA(blend);

        // Blender can have multiple scenes, not sure yet how to get the active scene.
        // So lets simply take the first one.
        if (blend.scenes.length)
        {
            var scene = blend.scenes[0];

            buildScene(scene);
        }

        outputDiv.innerHTML = "Parse time: " + (new Date().getTime() - startTime) + "ms\n\n" + outputText;
    }

    /**
     * Builds a Blender Scene.
     *
     * @param scene
     */
    function buildScene(scene)
    {
        var obj = scene.base.first;

        while (obj)
        {
            // grab the Blender Object.
            // The Blender Object defines rotation, scale, translation etc.
            var object = obj.object;

            if (object && object.data)
            {
                output("Object name: " + object.id.name + " type: " + object.type + " matrix: " + object.obmat);

                switch (object.type)
                {
                    case 1:    // Mesh
                        output(" -> Mesh: " + object.data.id.name);
                        buildMesh(object.data);
                        break;
                    case 10: // Lamp
                        output(" -> Lamp: " + object.data.id.name);
                        break;
                    case 11: // Camera
                        output(" -> Camera: " + object.data.id.name);
                        break;
                    default:
                        console.log("unknown type: " + object.type);
                        break;
                }
            }

            obj = obj.next;
        }
    }

    /**
     * Builds a Blender Mesh.
     *
     * @param    mesh
     */
    function buildMesh(mesh)
    {
        var numVertices = mesh.totvert;
        var numFaces = mesh.totface;
        var i;

        output(" -> #verts : " + numVertices);

        for (i = 0; i < numVertices; i++)
        {
            var v = mesh.mvert[i];

            var x = v.co[0];
            var y = v.co[1];
            var z = v.co[2];

            output(" -> -> vertex: " + x + " " + y + " " + z);
        }

        output(" -> #faces : " + numFaces);

        for (i = 0; i < numFaces; i++)
        {
            var f = mesh.mface[i];

            var v1 = f.v1;
            var v2 = f.v2;
            var v3 = f.v3;
            var v4 = f.v4;

            output(" -> -> indices: " + v1 + " " + v2 + " " + v3 + " " + v4);

            if (mesh.mtface)
            {
                // UV coords are defined
                var tf = mesh.mtface[i];

                output(" -> -> -> uv: " + tf.uv);
            }
        }
    }

    /**
     * Prints out the DNA as contained in the .blend
     */
    function printDNA(blend)
    {
        var structs = blend.dna.structs;

        var struct;
        var field;
        var type;
        var field;
        var i, i2, l, l2;

        for (i = 0,l = structs.length; i < l; i++)
        {
            struct = structs[i];
            type = blend.dna.types[struct.type];

            output(type);

            for (i2 = 0,l2 = struct.fields.length; i2 < l2; i2++)
            {
                field = struct.fields[i2];
                output(" -> " + field.type + " " + field.name);
            }
        }
    }

    function output(str)
    {
        outputText += str + "\n";
    }

    function outputProps(obj, depth)
    {
        if (depth === undefined)
        {
            depth = 0;
        }

        for (var i in obj)
        {
            for (var i2 = 0; i2 < depth; i2++)
            {
                outputText += "  ";
            }

            if (typeof(obj[i]) == "object")
            {
                outputText += i + "\n";
                outputProps(obj[i], depth + 1);
            }
            else
            {
                outputText += i + ": " + obj[i] + "\n";
            }
        }
    }
}
