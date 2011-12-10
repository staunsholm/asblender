package {
	import com.floorplanner.blender.dna.DNAField;
	import com.floorplanner.blender.dna.DNAStruct;
	import com.floorplanner.blender.file.BlendFile;

	import flash.display.Sprite;
	import flash.display.StageAlign;
	import flash.display.StageQuality;
	import flash.display.StageScaleMode;

	[SWF (backgroundColor="#000000")]
	
	/**
	 * @author timknip
	 */
	public class Main extends Sprite {
		
		//[Embed (source="/assets/tiefighterlowtriang.blend", mimeType="application/octet-stream")]
		[Embed (source="/assets/threecubes.blend", mimeType="application/octet-stream")]
		//[Embed (source="/assets/crystal_cube.blend", mimeType="application/octet-stream")]
		public var BlenderData:Class;
		
		public var container:Sprite;

		public function Main() {
			super();
			
			init();
		}
		
		private function init() {
		
			stage.align = StageAlign.TOP_LEFT;
			stage.scaleMode = StageScaleMode.NO_SCALE;
			stage.frameRate = 60;
			stage.quality = StageQuality.LOW;
			
			this.container = new Sprite();
			addChild(this.container);
			this.container.x = stage.stageWidth * 0.5;
			this.container.y = stage.stageHeight * 0.5;
			
			var blend = new BlendFile();
			
			blend.read(new BlenderData());
			
			// Uncomment the following line to trace out the complete DNA
			//printDNA(blend);
			
			// Blender can have multiple scenes, not sure yet how to get the active scene.
			// So lets simply take the first one.
			if (blend.scenes.length) {
				var scene = blend.scenes[0];
				
				buildScene(scene);
			}
		}
		
		/**
		 * Builds a Blender Scene.
		 * 
		 * @param scene
		 */
		private function buildScene(scene) {

			var obj = scene.base.first;
			
			while (obj) {
				// grab the Blender Object.
				// The Blender Object defines rotation, scale, translation etc.
				var object = obj.object;
				
				trace("Object name: " + object.id.name + " type: " + object.type + " matrix: " + object.obmat);
				
				// Uncomment following line to show props, guess you'll be using this one a lot :-)
				//printObject(object);
				
				if (object.data) {
					switch (object.type) {
						case 1:	// Mesh
							trace (" -> Mesh: " + object.data.id.name);
							buildMesh(object.data);
							break;
						case 10: // Lamp
							trace (" -> Lamp: " + object.data.id.name);
							break;
						case 11: // Camera
							trace (" -> Camera: " + object.data.id.name);
							break;
						default:
							break;
					}
				}
				
				obj = obj.next;
			}
		}
		
		/**
		 * Builds a Blender Mesh.
		 * 
		 * @param	mesh
		 */
		private function buildMesh(mesh) {
			var numVertices = mesh.totvert;
			var numFaces = mesh.totface;
			var i;
			
			trace(" -> #verts : " + numVertices);
		
			for (i = 0; i < numVertices; i++) {	
				var v = mesh.mvert[i];
				
				var x:Number = v.co[0];
				var y:Number = v.co[1];
				var z:Number = v.co[2];
				
				trace(" -> -> vertex: " + x + " " + y + " " + z);
			}
			
			trace(" -> #faces : " + numFaces);
			
			for (i = 0; i < numFaces; i++) {	
				var f = mesh.mface[i];
				
				var v1 = f.v1;
				var v2 = f.v2;
				var v3 = f.v3;
				var v4 = f.v4;
				
				trace(" -> -> indices: " + v1 + " " + v2 + " " + v3 + " " + v4);
				
				if (mesh.mtface) {
					// UV coords are defined
					var tf = mesh.mtface[i];
					
					trace(" -> -> -> uv: " + tf.uv);
				}
			}
		}
		
		/**
		 * Prints out the DNA as contained in the .blend
		 */
		private function printDNA(blend) {
			var struct;
			var field:DNAField;
			
			for each (struct in blend.dna.structs) {
				var type:String = blend.dna.types[ struct.type ];
				
				trace(type);
				
				for each (field in struct.fields) {
					trace(" -> " + field.type + " " + field.name);
				}
			}
		}
		
		/**
		 * 
		 */
		private function printObject(object) {
			for (var key:String in object) {
				trace(key + " : " + object[key]);
			}
		}
	}
}
