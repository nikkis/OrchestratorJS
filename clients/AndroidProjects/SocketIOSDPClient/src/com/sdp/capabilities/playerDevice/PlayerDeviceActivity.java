package com.sdp.capabilities.playerDevice;

import org.json.JSONArray;
import org.json.JSONObject;

import com.sdp.socketiosdpclient.MainActivity;
import com.sdp.socketiosdpclient.R;
import com.sdp.socketiosdpclient.R.layout;
import com.sdp.socketiosdpclient.R.menu;

import android.os.Bundle;
import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.util.Log;
import android.view.Menu;
import android.webkit.WebView;

public class PlayerDeviceActivity extends Activity {

	
	protected static final String TAG = PlayerDeviceActivity.class.getSimpleName();

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_player_device);
		
		p("PlayerDeviceActivity created!");
		
		try {
			
			Bundle b = getIntent().getExtras();
			String url = b.getString("url_to_show");
			WebView myWebView = new WebView(getApplicationContext());                   
			myWebView.loadUrl(url);
			setTitle(getClass().getSimpleName());
			setContentView(myWebView);
			
			p("the end");
		} catch (Exception e) {
			p(e.toString());
		}
		
		
	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		// Inflate the menu; this adds items to the action bar if it is present.
		getMenuInflater().inflate(R.menu.activity_player_device, menu);
		return true;
	}

	
	
	private void p(String s) {
		Log.d(TAG, s);
	}

	
	
}
