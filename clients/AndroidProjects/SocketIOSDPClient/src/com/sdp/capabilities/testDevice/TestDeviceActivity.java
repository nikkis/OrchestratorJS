package com.sdp.capabilities.testDevice;

import org.json.JSONObject;

import com.sdp.socketiosdpclient.MainActivity;
import com.sdp.socketiosdpclient.R;
import com.sdp.socketiosdpclient.R.layout;
import com.sdp.socketiosdpclient.R.menu;

import android.os.Bundle;
import android.app.Activity;
import android.content.Intent;
import android.view.Menu;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;

public class TestDeviceActivity extends Activity {

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_test_device);
		
		Button bb = (Button)findViewById(R.id.testDeviceButton1);
		bb.setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View v) {
				try {
					JSONObject o = new JSONObject();
					o.put("key1", "value1");
					o.put("key2", "value2");
					Intent i = new Intent(MainActivity.SD_EVENT_FILTER);
					i.putExtra(MainActivity.SD_EVENT_PARAMS, o.toString());
					getApplicationContext().sendBroadcast(i);
				}catch(Exception e){
					e.printStackTrace();
				}
			}
		});
		
		
	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		// Inflate the menu; this adds items to the action bar if it is present.
		getMenuInflater().inflate(R.menu.test_device, menu);
		return true;
	}

	@Override
	protected void onPause() {
		this.finish();
		super.onPause();
	}
	
	

}
