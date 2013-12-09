package com.sdp.capabilities.urlScreen;

import org.json.JSONArray;
import org.json.JSONObject;

import com.sdp.capabilities.playerDevice.PlayerDeviceActivity;

import android.annotation.SuppressLint;
import android.content.Context;
import android.content.Intent;


public class UrlScreen {

	/*************************************************************************
	 * 	SDP stuff                                                            *
	 *************************************************************************/
	private static Context applicationContext;	
	public void setApplicationContext(Context applicationContext) {
		UrlScreen.applicationContext = applicationContext;
	}
	/*************************************************************************/

	

	@SuppressLint("NewApi")
	public JSONObject showUrl(JSONArray JSONmethodcallParameters) throws Exception {
		JSONObject retVal = new JSONObject();
		String url = JSONmethodcallParameters.getString(0);
		Intent i = new Intent(applicationContext, UrlScreenActivity.class);
		i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
		i.putExtra("url_to_show", url);
		applicationContext.startActivity(i);
		return retVal;
	}	
	
	
}
