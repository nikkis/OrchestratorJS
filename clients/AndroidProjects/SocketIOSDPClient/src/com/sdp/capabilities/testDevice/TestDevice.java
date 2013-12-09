package com.sdp.capabilities.testDevice;


import org.json.JSONArray;
import org.json.JSONObject;

import com.sdp.capabilities.urlScreen.UrlScreenActivity;

import android.annotation.SuppressLint;
import android.content.Context;
import android.content.Intent;

public class TestDevice {


	private static Context applicationContext;	
	public void setApplicationContext(Context applicationContext) {
		TestDevice.applicationContext = applicationContext;
	}



	@SuppressLint("NewApi")
	public Object throwException() throws Exception {

		if(true)
			throw(new Exception("voi rahma"));
		
		return null;
	}
	
	@SuppressLint("NewApi")
	public Object test() throws Exception {				
		Intent i = new Intent(applicationContext, TestDeviceActivity.class);
		i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
		applicationContext.startActivity(i);
		return false;
	}

}










