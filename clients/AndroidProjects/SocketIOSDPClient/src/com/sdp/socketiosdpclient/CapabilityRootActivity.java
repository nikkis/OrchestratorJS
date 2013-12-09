package com.sdp.socketiosdpclient;

import java.util.ArrayList;

import android.os.Bundle;
import android.app.Activity;
import android.view.Menu;

public class CapabilityRootActivity extends Activity {
	
    private static final String TAG=CapabilityRootActivity.class.getName();
    private static ArrayList<Activity> activities=new ArrayList<Activity>();


    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        activities.add(this);
    }

    @Override
    public void onDestroy()
    {
        super.onDestroy();
        activities.remove(this);
    }

    public static void finishAll()
    {
        for(Activity activity:activities)
           activity.finish();
    }


}
