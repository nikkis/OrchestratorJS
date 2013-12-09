package com.sdp.socketiosdpclient.helpers;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import android.annotation.SuppressLint;
import android.content.Context;
import android.content.SharedPreferences;
import android.preference.PreferenceManager;
import android.util.Log;

public class SettingHelpers {

	private static SharedPreferences prefs;

	private static final String enabled_capabilities_preferences_name = "enabled_capabilities";

	private static String defaul_orch_host = "social.cs.tut.fi";
	private static String defaul_orch_port = "8080";

	private static String defaul_prox_host = "social.cs.tut.fi";
	private static String defaul_prox_port = "8999";
	
	public static String getStringValue(String key, Context serviceOrActivity) {
		
		prefs = PreferenceManager.getDefaultSharedPreferences(serviceOrActivity); //serviceOrActivity.getSharedPreferences(PREFERENCES_NAME, serviceOrActivity.MODE_PRIVATE);
		String val = prefs.getString(key,"");
		
		
		
		//serviceOrActivity.getSharedPreferences(name, mode)
		
		if(val.equals("") && key.equals("orchestrator_host")) {
			return defaul_orch_host;
		} else if(val.equals("") && key.equals("orchestrator_port")) {
			return defaul_orch_port;
		} else if(val.equals("") && key.equals("proximity_host")) {
			return defaul_prox_host;
		} else if(val.equals("") && key.equals("proximity_port")) {
			return defaul_prox_port;
		} else {
			return val;
		}
	}
	
	
	
	

	
	public static void setBooleanValue(String key, boolean value, Context serviceOrActivity) {
		prefs = PreferenceManager.getDefaultSharedPreferences(serviceOrActivity);
		SharedPreferences.Editor editor = prefs.edit();
		editor.putBoolean(key, value);
		editor.commit();
		return ;
	}


	public static void setStringValue(String key, String value, Context serviceOrActivity) {
		prefs = PreferenceManager.getDefaultSharedPreferences(serviceOrActivity);
		SharedPreferences.Editor editor = prefs.edit();
		editor.putString(key, value);
		editor.commit();
		return ;
	}
	
	
	/*

	public static boolean saveInterfacesArray(Map<String, String> enabledInterfaces, Context serviceOrActivity) {   
		//prefs = PreferenceManager.getDefaultSharedPreferences(serviceOrActivity);
		prefs = serviceOrActivity.getSharedPreferences("SocialDevicesEnabledInterfaces", Context.MODE_MULTI_PROCESS);
	    SharedPreferences.Editor editor = prefs.edit();  
	    editor.putInt(enabled_capabilities_preferences_name +"_size", enabledInterfaces.size());  
	    
	    int i = 0;
		for (Entry<String, String> entry : enabledInterfaces.entrySet()) {
			editor.putString(enabled_capabilities_preferences_name + "_key_" + i, entry.getKey());
			editor.putString(enabled_capabilities_preferences_name + "_val_" + i, entry.getValue());
			i++;
		}
	    return editor.commit();  
	} 
	
	
	public static Map<String, String> loadInterfacesArray(Context serviceOrActivity) {
		Map<String, String> retVal = new HashMap<String, String>();
		//prefs = PreferenceManager.getDefaultSharedPreferences(serviceOrActivity);
		prefs = serviceOrActivity.getSharedPreferences("SocialDevicesEnabledInterfaces", Context.MODE_MULTI_PROCESS);
	    int size = prefs.getInt(enabled_capabilities_preferences_name + "_size", 0);  
	    for(int i=0;i<size;i++) {
	    	String key = prefs.getString(enabled_capabilities_preferences_name + "_key_" + i, null);
	    	String val = prefs.getString(enabled_capabilities_preferences_name + "_val_" + i, null);
	    	
	    	p("HH: "+key+" : "+val);
	    	if(!val.equals("0"))
	    		retVal.put(key, val);
	    }
	    return retVal;  
	}
	*/
	
	
	

	public static void p(String s){
		Log.e("SettingHelpers", s.toString());
	}


	
	/////////////// Multiprocess
	static String multiProcessSettingsFile = "SocialDevicesMultiProcessFileOrchestrator2";
	public static boolean getMultiProcessBooleanValue(String key, Context serviceOrActivity) {
		prefs = serviceOrActivity.getSharedPreferences(multiProcessSettingsFile, Context.MODE_MULTI_PROCESS);
		return prefs.getBoolean(key, false);
	}
	public static void setMultiProcessBooleanValue(String key, boolean value, Context serviceOrActivity) {
		prefs = serviceOrActivity.getSharedPreferences(multiProcessSettingsFile, Context.MODE_MULTI_PROCESS);
		SharedPreferences.Editor editor = prefs.edit();
		editor.putBoolean(key, value);
		editor.commit();
		return ;
	}
	
	
	static final String ENABLED_CAPABILITIES = "ENABLED_CAPABILITIES_SET";
	@SuppressLint("NewApi") 
	public static void saveEnabledCapabilities(Set<String> enabledCapabilities, Context serviceOrActivity) {
		prefs = serviceOrActivity.getSharedPreferences(multiProcessSettingsFile, Context.MODE_MULTI_PROCESS);
		SharedPreferences.Editor editor = prefs.edit();
		
		Set<String> newSet =  new HashSet<String>();
		for (String string : enabledCapabilities) {
			newSet.add(string);
		}
		editor.putStringSet(ENABLED_CAPABILITIES, newSet);
		editor.commit();
		return;
	}
	
	@SuppressLint("NewApi") 
	public static Set<String> loadEnabledCapabilities(Context serviceOrActivity) {
		prefs = serviceOrActivity.getSharedPreferences(multiProcessSettingsFile, Context.MODE_MULTI_PROCESS);
		Set<String> temp = prefs.getStringSet(ENABLED_CAPABILITIES, new HashSet<String>());
		
		Set<String> newSet =  new HashSet<String>();
		for (String string : temp) {
			newSet.add(string);
		}
		
		return newSet;
	}
	
	/////////////// Multiprocess end
	
	
}
