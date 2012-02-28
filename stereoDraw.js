﻿/*

HTML5 Stereo Viewer

version 1.3 Simplifed

Copyright (C) 2011 Yury Golubinsky mod by logicmd

This work is licensed under the
Creative Commons Attribution 3.0 Unported License.
To view a copy of this license,
visit http://creativecommons.org/licenses/by/3.0/

*/

function stereoDrawImage(imgSrc, stereoType, anaglyphMode, glassType, cnvsDstID) {
	
	/*
	 * 以下是alt方法获得img的src，无论如何DOM中必须载入
	 * img标签，可以不显示，但是比如载入作为DOM的resource
	 * 
	 * var imgArray = document.getElementsByTagName(img);
	 * var imgNum = imgArray.length;
	 * 
	 */
	
	var img = new Image();
	img.src = imgSrc;
	var imgArray = document.getElementsByTagName('img');
	var imgNum = imgArray.length;
	//img = imgArray[0];
	var loadHeight = img.height;
	var loadWidth = img.width;
	
	/* 
	 * 必须存在这个ID的canvas
	 * 通常cnvsDstID取'stereoCanvas'
	 */
	
	var cnvs = document.getElementById(cnvsDstID);
	// not working right now.
	if(!cnvs) {
		cnvs = document.createElement("canvas");
		cnvs.id = cnvsDstID;
		end = document.getElementById("canvasEnd");
		document.body.insertBefore(cnvs, end);
	}
	var ctx = cnvs.getContext('2d');
	
	// 获得Canvas尺寸
	var imw = 0, imh = 0; 
	prepareSize(imw, imh); 
	cnvs.width = imw;
	cnvs.height = imh;
	
	// 两个视点的图像数据
	var tmpCnvs1 = document.createElement('canvas');
	var iData1 = 0;
	var iData2 = 0;
	prepareData(imw, imh, iData1, iData2);
	
	// 准备Canvas图像数据
	imageData = ctx.createImageData(imw, imh);
	process(imw, imh, iData1, iData2);

	/* 
	 * prepareSize()
	 * 分多种类型准备DstCanvas的尺寸、
	 * 
	 * @_imw -> 输出计算出的宽度
	 * @_imh -> 输出计算出的高度
	 * 
	 * flat: do nothing
	 * anaglyph: do nothing
	 * stereoLR: width要折半
	 * stereoUD: height要折半
	 * 
	 */
	
	function prepareSize(_imw, _imh) {
		switch(stereoType) {
			case 'Anaglyph':
			case 'Flat':
				imw = loadWidth;
				imh = loadHeight;
				break;
			case 'StereoLR':
			case 'StereoRL':
				imw = loadWidth/2;
				imh = loadHeight;
				break;
			case 'StereoWD':
				imw = loadWidth;
				imh = loadHeight/2;
				break;
		}
	};
	/* 
	 * prepareData()
	 *
	 * 分多种类型准备DstCanvas的两个视点的数据
	 * iData1和iData2
	 * 
	 * @_imw <- 输入Canvas宽度
	 * @_imh <- 输入Canvas高度
	 * @_iData1 -> 输出左眼视点数据
	 * @_iData2 -> 输出右眼视点数据
	 * 
	 * flat: 
	 * anaglyph: do nothing
	 * stereoLR: 左右两个视点
	 * stereoUD: 上下两个视点
	 * 
	 */
	function prepareData(_imw, _imh, _iData1, _iData2) {
		var buf = document.createElement('canvas');
		buf.width = loadWidth;
		buf.height = loadHeight;
		bufctx = buf.getContext('2d');
		bufctx.drawImage(img, 0, 0, loadWidth, loadHeight);
		
		switch(stereoType) {
			case "Anaglyph":
			case "Flat":
				iData1 = bufctx.getImageData(0, 0, imw, imh);
				iData2 = iData1;
				break;
			case "StereoLR":
				iData1 = bufctx.getImageData(0, 0, imw, imh);
				iData2 = bufctx.getImageData(imw, 0, imw, imh);
				break;
			case "StereoRL":
				iData2 = bufctx.getImageData(0, 0, imw, imh);
				iData1 = bufctx.getImageData(imw, 0, imw, imh);
				break;	
			case "StereoUD":
				iData1 = bufctx.getImageData(0, 0, imw, imh);
				iData2 = bufctx.getImageData(0, imh, imw, imh);
			case "StereoDU":
				iData2 = bufctx.getImageData(0, 0, imw, imh);
				iData1 = bufctx.getImageData(0, imh, imw, imh);
				break;
		}
	};
	/* 
	 * process()
	 *
	 * 根据输入的宽高和左右眼输出混合后的数据
	 * 
	 * @_imw <- 输入Canvas宽度
	 * @_imh <- 输入Canvas高度
	 * @_iData1 <- 输入左眼视点数据
	 * @_iData2 <- 输入右眼视点数据
	 * @imageData -> 输出图像数据
	 * 
	 * 
	 * 
	 */
	function process(_imw, _imh, _iData1, _iData2) {
		var index = 0;
		var y = imw * imh;
		
		switch(anaglyphMode) {
			case 'TrueAnaglyph':
				if (glassType == 'RedCyan') {
					var idr = iData1;
					var idg = iData2;
					var idb = iData2;
				}
				else if (glassType == 'GreenMagenta') {
					var idr = iData2;
					var idg = iData1;
					var idb = iData1;
				}
				else {
					return;
				}
					
				for (x = 0; x++ < y; ) {
					// Data1 - left; Data2 - right
					r = idr.data[index+0] * 0.299 + idr.data[index+1] * 0.587 + idr.data[index+2] * 0.114;
					if (glassType == 'GreenMagenta') {
						g = idg.data[index+0] * 0.299 + idg.data[index+1] * 0.587 + idg.data[index+2] * 0.114;
						b = 0;
					} else {
						g = 0;
						b = idb.data[index+0] * 0.299 + idb.data[index+1] * 0.587 + idb.data[index+2] * 0.114;
					}
					r = Math.min(Math.max(r, 0), 255);
					b = Math.min(Math.max(b, 0), 255);
					imageData.data[index++] = r;
					imageData.data[index++] = g;
					imageData.data[index++] = b;
					imageData.data[index++] = 0xFF;

				};
				break;
			
			case 'GrayAnaglyph':
				if (glassType == 'RedCyan') {
					var idr = iData1;
					var idg = iData2;
					var idb = iData2;
				}
				else if (glassType == 'GreenMagenta') {
					var idr = iData2;
					var idg = iData1;
					var idb = iData2;
				}
				else {
					return;
				}
					
				for (x = 0; x++ < y; ) {
					// Data1 - left; Data2 - right
					r = idr.data[index+0] * 0.299 + idr.data[index+1] * 0.587 + idr.data[index+2] * 0.114;
					g = idg.data[index+0] * 0.299 + idg.data[index+1] * 0.587 + idg.data[index+2] * 0.114;
					b = idb.data[index+0] * 0.299 + idb.data[index+1] * 0.587 + idb.data[index+2] * 0.114;
					r = Math.min(Math.max(r, 0), 255);
					g = Math.min(Math.max(g, 0), 255);
					b = Math.min(Math.max(b, 0), 255);
					imageData.data[index++] = r;
					imageData.data[index++] = g;
					imageData.data[index++] = b;
					imageData.data[index++] = 0xFF;
				};
				break;
				
			case 'ColorAnaglyph':
				if (glassType == 'RedCyan') {
					var idr = iData1;
					var idg = iData2;
					var idb = iData2;
				}
				else if (glassType == 'GreenMagenta') {
					var idr = iData2;
					var idg = iData1;
					var idb = iData2;
				}
				else {
					return;
				}
					
				for (x = 0; x++ < y; ) {
					// Data1 - left; Data2 - right
					imageData.data[index] = idr.data[index++];
					imageData.data[index] = idg.data[index++];
					imageData.data[index] = idb.data[index++];
					imageData.data[index] = 0xFF; index++;
				};
				break;
			
			case 'OptimizedAnaglyph':
				if (glassType == 'RedCyan') {
					var idr = iData1;
					var idg = iData2;
					var idb = iData2;
				}
				else if (glassType == 'GreenMagenta') {
					var idr = iData2;
					var idg = iData1;
					var idb = iData2;
				}
				else {
					return;
				}
					
				for (x = 0; x++ < y; ) {
					// Data1 - left; Data2 - right
					r = idr.data[index+1] * 0.7 + idr.data[index+2] * 0.3;
					g = idg.data[index+1];
					b = idb.data[index+2];
					r = Math.min(Math.max(r, 0), 255);			
					imageData.data[index++] = r;
					imageData.data[index++] = g;
					imageData.data[index++] = b;
					imageData.data[index++] = 0xFF;
				}
				break;			
			
			case 'Optimized+Anaglyph':
				if (glassType == 'RedCyan') {
					var idr = iData1;
					var idg = iData2;
					var idb = iData2;
				}
				else if (glassType == 'GreenMagenta') {
					var idr = iData2;
					var idg = iData1;
					var idb = iData2;
				}
				else {
					return;
				}
					
				for (x = 0; x++ < y; ) {
					// Data1 - left; Data2 - right
					g = idr.data[index+1] + 0.45 * Math.max(0, idr.data[index+0] - idr.data[index+1]);
					b = idr.data[index+2] + 0.25 * Math.max(0, idr.data[index+0] - idr.data[index+2]);
					r = g * 0.749 + b * 0.251;
					//r = Math.pow(g * 0.749 + b * 0.251, 1/1.6);
					g = idg.data[index+1] + 0.45 * Math.max(0, idg.data[index+0] - idg.data[index+1]);
					b = idb.data[index+2] + 0.25 * Math.max(0, idb.data[index+0] - idb.data[index+2]);
					r = Math.min(Math.max(r, 0), 255);
					g = Math.min(Math.max(g, 0), 255);
					b = Math.min(Math.max(b, 0), 255);
					imageData.data[index++] = r;
					imageData.data[index++] = g;
					imageData.data[index++] = b;
					imageData.data[index++] = 0xFF;
				}
				break;	
		}
		ctx.putImageData(imageData, 0, 0);
		
	};
	
}
