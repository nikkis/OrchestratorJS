package com.sdp.socketiosdpclient.helpers;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;
import org.json.JSONObject;

import android.os.AsyncTask;
import android.util.Log;

public class HttpHelpers {

	
	

	// Takes JSONObject[], where only 1 object, which contains uri, method, and parameters
	public static class SendHttpRequestTask extends AsyncTask <JSONObject,Void,Void> {

		@Override
		protected Void doInBackground(JSONObject... params) {

			try {

				JSONObject parameters = params[0];
				String uri = parameters.getString("uri");

				p("Sending http request to: "+uri);
				
				String method = parameters.getString("method");
				method = method.toLowerCase();

				
				// create parameters
				
				JSONObject reqParams = parameters.getJSONObject("parameters");
				List<NameValuePair> nameValuePairs = new ArrayList<NameValuePair>(10);

				Iterator iter = reqParams.keys();
				while(iter.hasNext()){
					String key = (String)iter.next();
					String val = reqParams.getString(key);
					p("key: "+key);
					p("val: "+val);
					nameValuePairs.add(new BasicNameValuePair(key, val));
				}
				
				
				HttpClient httpclient = new DefaultHttpClient();
				HttpPost httpUriReq = null;
				if(method.equals("post")) {
					httpUriReq = new HttpPost(uri);
					httpUriReq.setEntity(new UrlEncodedFormEntity(nameValuePairs));
				}
				
				// Execute HTTP Post Request
				HttpResponse response = httpclient.execute(httpUriReq);

				int statusCode = response.getStatusLine().getStatusCode();
				if(statusCode != 200) {
					
					String contents = EntityUtils.toString(response.getEntity());
					p(contents);
					
					/*
					if(SettingHelpers.getMultiProcessBooleanValue("showDebugNotifications", OrchestratorService.selfReference.getApplicationContext())) {
						p("showing debugError");
						Toast.makeText(OrchestratorService.selfReference.getApplicationContext(), "Cannot send button event: "+contents, Toast.LENGTH_LONG).show();
					}
					*/
				}
				
				
				p(Integer.toString(statusCode));

			} catch (Exception e) {
				p("Error in http request task");
				e.printStackTrace();
			}
			return null;
		}
	}


	public static void p(String s){
		Log.e("HttpHelpers", s.toString());
	}

}
