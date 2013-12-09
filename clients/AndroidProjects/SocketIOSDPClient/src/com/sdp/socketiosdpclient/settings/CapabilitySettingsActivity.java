package com.sdp.socketiosdpclient.settings;


import android.annotation.TargetApi;
import android.content.Context;
import android.content.Intent;
import android.content.res.Configuration;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Bundle;
import android.os.Looper;
import android.os.StrictMode;
import android.preference.CheckBoxPreference;
import android.preference.ListPreference;
import android.preference.Preference;
import android.preference.PreferenceActivity;
import android.preference.PreferenceCategory;
import android.preference.PreferenceFragment;
import android.preference.PreferenceManager;
import android.preference.PreferenceScreen;
import android.preference.RingtonePreference;
import android.provider.SyncStateContract.Helpers;
import android.text.TextUtils;
import android.util.Log;
import android.view.ViewGroup;
import android.view.ViewGroup.LayoutParams;
import android.widget.CheckBox;
import android.widget.LinearLayout;
import android.widget.ListView;
import android.widget.Toast;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.util.EntityUtils;
import org.json.JSONArray;
import org.json.JSONObject;

import com.sdp.socketiosdpclient.R;
import com.sdp.socketiosdpclient.helpers.SettingHelpers;

/**
 * A {@link PreferenceActivity} that presents a set of application settings. On
 * handset devices, settings are presented as a single list. On tablets,
 * settings are split by category, with category headers shown to the left of
 * the list of settings.
 * <p>
 * See <a href="http://developer.android.com/design/patterns/settings.html">
 * Android Design: Settings</a> for design guidelines and the <a
 * href="http://developer.android.com/guide/topics/ui/settings.html">Settings
 * API Guide</a> for more information on developing a Settings UI.
 */
public class CapabilitySettingsActivity extends PreferenceActivity {
	/**
	 * Determines whether to always show the simplified settings UI, where
	 * settings are presented in a single list. When false, settings are shown
	 * as a master/detail two-pane view on tablets. When true, a single pane is
	 * shown on tablets.
	 */
	private static final boolean ALWAYS_SIMPLE_PREFS = false;

	private static String temphost = null; //"192.168.1.66";
	private static String CAPABILITY_LIST_URI = null; //"http://"+temphost+":8080/api/1/capability";

	private LinearLayout rootView;
	private ListView preferenceView;

	public static CapabilitySettingsActivity singletonReference = null;

	protected static Set<String> CAPSBILITIES = null;
	private static Set<String> enabledCapabilities = new HashSet<String>();

	@Override
	protected void onPostCreate(Bundle savedInstanceState) {
		super.onPostCreate(savedInstanceState);

		temphost = SettingHelpers.getStringValue("orchestrator_host", this);
		CapabilitySettingsActivity.CAPABILITY_LIST_URI = "http://"+temphost+":8080/api/1/capability";
		CapabilitySettingsActivity.singletonReference = this;
		
		CapabilitySettingsActivity.enabledCapabilities = SettingHelpers.loadEnabledCapabilities(singletonReference.getApplicationContext());
p("shaizze: " + enabledCapabilities.toString());
		
		addPreferencesFromResource(R.xml.pref_capability);
		createPreferenceHierarchy();
	}




	public void createPreferenceHierarchy(){
		
		new Thread(new Runnable() {
			public void run() {

				Looper.prepare();
				p(enabledCapabilities.toString());
				p("niiinkuu");
				CapabilitySettingsActivity.CAPSBILITIES = getInterfacesListFromServer();

				runOnUiThread(new Runnable() {
					public void run() {
						rootView = new LinearLayout(CapabilitySettingsActivity.singletonReference);
						rootView.setLayoutParams(new LayoutParams(LayoutParams.FILL_PARENT, LayoutParams.FILL_PARENT));
						rootView.setOrientation(LinearLayout.VERTICAL);

						preferenceView = new ListView(CapabilitySettingsActivity.singletonReference);
						preferenceView.setLayoutParams(new LayoutParams(LayoutParams.FILL_PARENT, LayoutParams.FILL_PARENT));
						preferenceView.setId(android.R.id.list);

						PreferenceScreen screen = CapabilitySettingsActivity.singletonReference.getPreferenceScreen();
						PreferenceCategory firstCategory = (PreferenceCategory) screen.findPreference("enabledCapabilitiesCategory");
						screen.addPreference(firstCategory);

						for (String capability : CapabilitySettingsActivity.CAPSBILITIES) {
							CheckBoxPreference cb = new CheckBoxPreference(CapabilitySettingsActivity.singletonReference);
							cb.setTitle(capability);
							firstCategory.addPreference(cb);
							cb.setChecked(CapabilitySettingsActivity.enabledCapabilities.contains(capability));
							cb.setOnPreferenceChangeListener(sBindPreferenceSummaryToValueListener);
						}
						
						screen.bind(preferenceView);
						preferenceView.setAdapter(screen.getRootAdapter());

						rootView.removeView(preferenceView);
						rootView.addView(preferenceView);

						CapabilitySettingsActivity.singletonReference.setContentView(rootView);
						setPreferenceScreen(screen);
					}
				});
			}
		}).start();
	}
	





	private Set<String> getInterfacesListFromServer() {
		Set<String> res = new HashSet<String>();
		try {
			HttpClient httpclient = new DefaultHttpClient();
			HttpGet httpget = new HttpGet(CAPABILITY_LIST_URI);
			// Execute HTTP Post Request
			HttpResponse response = httpclient.execute(httpget);
			int statusCode = response.getStatusLine().getStatusCode();
			p(Integer.toString(statusCode));
			if(statusCode != 200) {
				p("cannot load the list");
				throw new Exception("Cannot load interface list");
			}
			String contents = EntityUtils.toString(response.getEntity());
			p(contents);
			JSONObject jObject = new JSONObject(contents);
			JSONArray caps = jObject.getJSONArray("capabilities");
			for (int i = 0; i < caps.length(); i++) {
				String cap = caps.getString(i);
				res.add(cap);
			}
		} catch (Exception e) {
			p(e.toString());
		}
		return res;
	}






	/** {@inheritDoc} */
	@Override
	public boolean onIsMultiPane() {
		return isXLargeTablet(this) && !isSimplePreferences(this);
	}

	/**
	 * Helper method to determine if the device has an extra-large screen. For
	 * example, 10" tablets are extra-large.
	 */
	private static boolean isXLargeTablet(Context context) {
		return (context.getResources().getConfiguration().screenLayout & Configuration.SCREENLAYOUT_SIZE_MASK) >= Configuration.SCREENLAYOUT_SIZE_XLARGE;
	}

	/**
	 * Determines whether the simplified settings UI should be shown. This is
	 * true if this is forced via {@link #ALWAYS_SIMPLE_PREFS}, or the device
	 * doesn't have newer APIs like {@link PreferenceFragment}, or the device
	 * doesn't have an extra-large screen. In these cases, a single-pane
	 * "simplified" settings UI should be shown.
	 */
	private static boolean isSimplePreferences(Context context) {
		return ALWAYS_SIMPLE_PREFS
				|| Build.VERSION.SDK_INT < Build.VERSION_CODES.HONEYCOMB
				|| !isXLargeTablet(context);
	}

	/** {@inheritDoc} */
	@Override
	@TargetApi(Build.VERSION_CODES.HONEYCOMB)
	public void onBuildHeaders(List<Header> target) {
		if (!isSimplePreferences(this)) {
			//loadHeadersFromResource(R.xml.advanced_pref_headers, target);

		}
	}

	/**
	 * A preference value change listener that updates the preference's summary
	 * to reflect its new value.
	 */
	private static Preference.OnPreferenceChangeListener sBindPreferenceSummaryToValueListener = new Preference.OnPreferenceChangeListener() {
		@Override
		public boolean onPreferenceChange(Preference preference, Object value) {
			String stringValue = value.toString();

			p("on change!!");
			p(stringValue);
			
			if(preference instanceof CheckBoxPreference) {
				CheckBoxPreference cb =  (CheckBoxPreference)preference;
				Boolean b = (Boolean)value;
				if(b) {
					CapabilitySettingsActivity.enabledCapabilities.add(cb.getTitle().toString());
				} else {
					CapabilitySettingsActivity.enabledCapabilities.remove(cb.getTitle().toString());
				}
				p(enabledCapabilities.toString());
				SettingHelpers.saveEnabledCapabilities(CapabilitySettingsActivity.enabledCapabilities, singletonReference.getApplicationContext());
				
				Set<String>sss = SettingHelpers.loadEnabledCapabilities(singletonReference);
				p("shit: "+sss.toString());
				
				
			} else {
				p("Other preference");
			}
			return true;
		}
	};






	/**
	 * Binds a preference's summary to its value. More specifically, when the
	 * preference's value is changed, its summary (line of text below the
	 * preference title) is updated to reflect the value. The summary is also
	 * immediately updated upon calling this method. The exact display format is
	 * dependent on the type of preference.
	 * 
	 * @see #sBindPreferenceSummaryToValueListener
	 */
	private static void bindPreferenceSummaryToValue(Preference preference) {
		// Set the listener to watch for value changes.
		preference
		.setOnPreferenceChangeListener(sBindPreferenceSummaryToValueListener);

		// Trigger the listener immediately with the preference's
		// current value.
		sBindPreferenceSummaryToValueListener.onPreferenceChange(
				preference,
				PreferenceManager.getDefaultSharedPreferences(
						preference.getContext()).getString(preference.getKey(),
								""));
	}

	private static void p(String s) {
		Log.d("CapabilitySettingsActivity", s);
	}

	@Override
	public void onBackPressed() {
		super.onBackPressed();
		p("onBackPressed");
	}

}

