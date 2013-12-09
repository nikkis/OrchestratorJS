package com.sdp.socketiosdpclient.settings;

import android.annotation.TargetApi;
import android.content.Context;
import android.content.res.Configuration;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.preference.CheckBoxPreference;
import android.preference.ListPreference;
import android.preference.Preference;
import android.preference.PreferenceActivity;
import android.preference.PreferenceCategory;
import android.preference.PreferenceFragment;
import android.preference.PreferenceManager;
import android.preference.RingtonePreference;
import android.text.TextUtils;
import android.widget.Toast;

import java.util.List;

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
public class GeneralSettingsActivity extends PreferenceActivity {
	/**
	 * Determines whether to always show the simplified settings UI, where
	 * settings are presented in a single list. When false, settings are shown
	 * as a master/detail two-pane view on tablets. When true, a single pane is
	 * shown on tablets.
	 */
	private static final boolean ALWAYS_SIMPLE_PREFS = false;

	// capability default value
	private static final String DEFAULT_VALUE = "0";

	
	
	
	@Override
	protected void onPostCreate(Bundle savedInstanceState) {
		super.onPostCreate(savedInstanceState);

		setupSimplePreferencesScreen();
		
	}

	/**
	 * Shows the simplified settings UI if the device configuration if the
	 * device configuration dictates that a simplified, single-pane UI should be
	 * shown.
	 */
	private void setupSimplePreferencesScreen() {
		if (!isSimplePreferences(this)) {
			return;
		}

		// In the simplified UI, fragments are not used at all and we instead
		// use the older PreferenceActivity APIs.

		// Add 'general' preferences.
		addPreferencesFromResource(R.xml.pref_general);

		
		/*
		
		// Add 'notifications' preferences, and a corresponding header.
		PreferenceCategory fakeHeader = new PreferenceCategory(this);
		fakeHeader.setTitle(R.string.pref_header_notifications);
		getPreferenceScreen().addPreference(fakeHeader);
		addPreferencesFromResource(R.xml.pref_notification);

		*/
		
		
		// Add 'data and sync' preferences, and a corresponding header.
		PreferenceCategory fakeHeader = new PreferenceCategory(this);
		fakeHeader.setTitle(R.string.pref_header_server_settings);
		getPreferenceScreen().addPreference(fakeHeader);
		addPreferencesFromResource(R.xml.pref_server_settings);

		// Bind the summaries of EditText/List/Dialog/Ringtone preferences to
		// their values. When their values change, their summaries are updated
		// to reflect the new value, per the Android Design guidelines.
		bindPreferenceSummaryToValue(findPreference("deviceIdentity"));
		bindPreferenceSummaryToValue(findPreference("deviceName"));
		
		

		Preference p = findPreference("showDebugNotifications");
		p.setOnPreferenceChangeListener(sBindPreferenceSummaryToValueListener);

		
		
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
			loadHeadersFromResource(R.xml.pref_headers, target);
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
			if (preference instanceof ListPreference) {
				// For list preferences, look up the correct display value in
				// the preference's 'entries' list.
				ListPreference listPreference = (ListPreference) preference;
				int index = listPreference.findIndexOfValue(stringValue);

				// Set the summary to reflect the new value.
				preference
						.setSummary(index >= 0 ? listPreference.getEntries()[index]
								: null);

			} else if (preference instanceof RingtonePreference) {
				// For ringtone preferences, look up the correct display value
				// using RingtoneManager.
				if (TextUtils.isEmpty(stringValue)) {
					// Empty values correspond to 'silent' (no ringtone).
					//preference.setSummary(R.string.pref_ringtone_silent);

				} else {
					Ringtone ringtone = RingtoneManager.getRingtone(
							preference.getContext(), Uri.parse(stringValue));

					if (ringtone == null) {
						// Clear the summary if there was a lookup error.
						preference.setSummary(null);
					} else {
						// Set the summary to reflect the new ringtone display
						// name.
						String name = ringtone
								.getTitle(preference.getContext());
						preference.setSummary(name);
					}
				}
			} else if (preference instanceof CheckBoxPreference) {
				
				SettingHelpers.p("Changing checkbox preference");
				
				if("showDebugNotifications".equals(preference.getKey())) {
					SettingHelpers.p("show debug");
					boolean val = (Boolean)value;
					if(val) {
						SettingHelpers.setMultiProcessBooleanValue("showDebugNotifications", true, preference.getContext().getApplicationContext());
						Toast.makeText(preference.getContext().getApplicationContext(), "Showing now notifications", Toast.LENGTH_LONG).show();
					} else {
						SettingHelpers.setMultiProcessBooleanValue("showDebugNotifications", false, preference.getContext().getApplicationContext());
					}
					
					
				}
				
			} else {
				// For all other preferences, set the summary to the value's
				// simple string representation.
				preference.setSummary(stringValue);
				SettingHelpers.setStringValue(preference.getKey(), stringValue, preference.getContext());
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

	/**
	 * This fragment shows general preferences only. It is used when the
	 * activity is showing a two-pane settings UI.
	 */
	@TargetApi(Build.VERSION_CODES.HONEYCOMB)
	public static class GeneralPreferenceFragment extends PreferenceFragment {
		@Override
		public void onCreate(Bundle savedInstanceState) {
			super.onCreate(savedInstanceState);
			addPreferencesFromResource(R.xml.pref_general);

			// Bind the summaries of EditText/List/Dialog/Ringtone preferences
			// to their values. When their values change, their summaries are
			// updated to reflect the new value, per the Android Design
			// guidelines.
			bindPreferenceSummaryToValue(findPreference("deviceIdentity"));
			
			//bindPreferenceSummaryToValue(findPreference("example_list"));
		}
	}

	/**
	 * This fragment shows notification preferences only. It is used when the
	 * activity is showing a two-pane settings UI.
	 */
	@TargetApi(Build.VERSION_CODES.HONEYCOMB)
	public static class NotificationPreferenceFragment extends
			PreferenceFragment {
		@Override
		public void onCreate(Bundle savedInstanceState) {
			super.onCreate(savedInstanceState);
			//addPreferencesFromResource(R.xml.pref_notification);

			// Bind the summaries of EditText/List/Dialog/Ringtone preferences
			// to their values. When their values change, their summaries are
			// updated to reflect the new value, per the Android Design
			// guidelines.
			bindPreferenceSummaryToValue(findPreference("notifications_new_message_ringtone"));
		}
	}

	
	
	
	
	
	
	/**
	 * This fragment shows data and sync preferences only. It is used when the
	 * activity is showing a two-pane settings UI.
	 */
	
	
	@TargetApi(Build.VERSION_CODES.HONEYCOMB)
	public static class ServerSettingsPreferenceFragment extends PreferenceFragment {
		@Override
		public void onCreate(Bundle savedInstanceState) {
			super.onCreate(savedInstanceState);
			addPreferencesFromResource(R.xml.pref_server_settings);

			// Bind the summaries of EditText/List/Dialog/Ringtone preferences
			// to their values. When their values change, their summaries are
			// updated to reflect the new value, per the Android Design
			// guidelines.
			bindPreferenceSummaryToValue(findPreference("hostname"));
		}
	}
	
	
	
	
	
	
	
	
	// capability handlers
	
/*
	
	private String createPreferenceHierarchy(PreferenceCategory firstCategory,
    		String capabilityName, List<String> capabilityNumbers) {
 
		//List<String> interfaceVersionList = new ArrayList<String>();
		List<String> entryValuesList = new ArrayList<String>();
		
		//interfaceVersionList.add("Disabled");
		entryValuesList.add(DEFAULT_VALUE);
		
		for (String versionNum : capabilityNumbers) {
			interfaceVersionList.add(capabilityName+" v. "+versionNum);
			entryValuesList.add(versionNum);
			//entryValuesList.add(interfaceName+"_v"+versionNum);
		}
		
		CharSequence interfaceVersions[] = interfaceVersionList.toArray(new CharSequence[interfaceVersionList.size()]);
		CharSequence entryValues[] = entryValuesList.toArray(new CharSequence[entryValuesList.size()]);
		 
        ListPreference listPreference = new ListPreference(this);
        
        String prefKey = capabilityName+"_preference";
        listPreference.setKey(prefKey);
        listPreference.setTitle(capabilityName);
        listPreference.setDefaultValue(DEFAULT_VALUE);
        listPreference.setEntries(interfaceVersions);
        listPreference.setEntryValues(entryValues);
        listPreference.setDialogTitle("Select version "+capabilityName);
         
        firstCategory.addPreference(listPreference);
         
        return prefKey;
    }
	
	*/
	
	/*
	public PreferenceScreen createPreferenceHierarchy(){
	    PreferenceScreen root = getPreferenceManager().createPreferenceScreen(this);

	    // category 1 created programmatically
	    PreferenceCategory cat1 = new PreferenceCategory(this);
	    cat1.setTitle("title");
	    root.addPreference(cat1);

	    ListPreference list1 = new ListPreference(this);
	    list1.setTitle("titteli");
	    list1.setSummary("summanen");      
	    list1.setDialogTitle("diallll");
	    list1.setKey("your_key");

	    List<String> list = Arrays.asList("foo", "bar", "waa");
	    CharSequence[] entries  = list.toArray(new CharSequence[list.size()]);
	    list1.setEntries(entries);
	    int length              = entries.length;
	    CharSequence[] values   = new CharSequence[length];
	    for (int i=0; i<length; i++){
	        CharSequence val = ""+i+1+"";
	        values[i] =  val;
	    }
	    list1.setEntryValues(values);

	    cat1.addPreference(list1);

	    PreferenceScreen preferenceScreen = getPreferenceScreen();
	    preferenceScreen.addPreference(cat1);
	    
	    return root;
	}
	
	
	

	private Map<String, List<String>> getInterfacesListFromServer() {
		Map<String,List<String>> map = new HashMap<String,List<String>>();
		try {
			HttpClient httpclient = new DefaultHttpClient();
			HttpGet httpget = new HttpGet(CAPABILITY_LIST_URI);

			// Execute HTTP Post Request
			HttpResponse response = httpclient.execute(httpget);
			int statusCode = response.getStatusLine().getStatusCode();
			SettingHelpers.p(Integer.toString(statusCode));
			
			if(statusCode != 200) {
				SettingHelpers.p("cannot load the list");
				throw new Exception("Cannot load interface list");
			}
			//p("got the response");
			String contents = EntityUtils.toString(response.getEntity());
			//p(contents);
			JSONObject jObject = new JSONObject(contents);

			Iterator iter = jObject.keys();
			while(iter.hasNext()){
				String key = (String)iter.next();
				JSONArray value = jObject.getJSONArray(key);
				List<String> versionNumbers = new ArrayList<String>();
				for (int i = 0; i < value.length(); i++) {
					String versionNum = value.getString(i);
					versionNumbers.add(versionNum);
				}
				map.put(key,versionNumbers);
			}
			
		} catch (Exception e) {
			SettingHelpers.p(e.toString());
		}
		
		return map;
	}
	
	
	*/
	
	
	
	
	
	
	
	
	
	
	
	
	
}
