package com.sdp.socketiosdpclient;

import java.io.File;
import java.lang.reflect.Method;
import java.net.URL;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;

import dalvik.system.DexFile;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

@SuppressLint("NewApi")
public class CapabilityHelpers {

	private static SharedPreferences prefs;
	private static final String enabled_interfaces_preferences_name = "enabled_interfaces";

	public static HashMap<String, Object[]> reloadInterfaces(Context c,	Activity a) {

		HashMap<String, Object[]> enabledInterfacesToReturn = new HashMap<String, Object[]>();

		// TODO:
		Map<String, String> loadedInterfaceNames = CapabilityHelpers.loadInterfacesArray(c);
		p("enabled interfaces:");
		for (Entry<String, String> entry : loadedInterfaceNames.entrySet()) {
			if (entry.getValue().equals("0") || entry.getValue().equals("disabled")) {
				// this.enabledInterfaces.remove(entry.getKey());
				continue;
			}
			p("loading: " + entry.getKey() + " val: " + entry.getValue());
			ArrayList<Object> loadedInterfaceDetails = reloadInterface(c, a, entry.getKey(), entry.getValue());
			if (loadedInterfaceDetails != null) {
				enabledInterfacesToReturn.put((String) (loadedInterfaceDetails.get(0)), new Object[] {
									(Class) (loadedInterfaceDetails.get(1)),
									(Object) (loadedInterfaceDetails.get(2)) 
								});
			}
		}
		p("enabled interfaces - the end");
		return enabledInterfacesToReturn;
	}

	private static ArrayList<Object> reloadInterface(Context c, Activity a, String interfaceName, String version) {

		ArrayList<Object> loadedInterfaceDetails = null;

		try {
			Context applicationContext = c;
			String fName = interfaceName + "_v" + version + ".apk";

			String fullJARPath = applicationContext.getFilesDir().getPath()
					.toString()
					+ "/";
			fullJARPath += fName;

			File file = new File(fullJARPath);
			file.setReadable(true, false);

			URL fileUrl;
			fileUrl = file.toURL();
			if (!file.exists()) {
				throw new Exception("File " + fName + " not found");
			}

			ClassLoader cl = c.getClassLoader();

			DexFile df = DexFile.loadDex(file.getAbsolutePath(), c
					.getFilesDir().getAbsolutePath()
					+ "/outputdexcontainer_"
					+ interfaceName + ".dex", 0);

			Class clazz = df.loadClass("com/sdp/deviceinterfaces/"
					+ interfaceName, cl);

			p("Loading inner classes for: " + interfaceName);
			try {
				String prefix = "com.sdp.deviceinterfaces." + interfaceName
						+ "$";
				Enumeration<String> entries = df.entries();
				while (entries.hasMoreElements()) {
					String nn = entries.nextElement();
					if (nn.contains(prefix)) {
						String innerClassPath = nn.replace(".", "/");
						p("Loading Also: " + innerClassPath);
						try {
							df.loadClass(innerClassPath, clazz.getClassLoader());
						} catch (Exception e) {
							p("Error while loading: " + innerClassPath + ", "
									+ e.toString());
						}
					}
				}
				p("Inner classes loaded too");
			} catch (Exception e) {
				p("Error while loading innerclasses: " + e.toString());
			}

			Object whatInstance = clazz.newInstance();

			try {
				Method myMethod1 = clazz.getMethod("setApplicationContext",
						new Class[] { Context.class });
				myMethod1.invoke(whatInstance, new Object[] { c });

			} catch (Exception e) {
				p("Error adding Application Context: " + e.toString() + ", ");
				return null;
			}

			// Special cases
			try {
				Method setActionMethod = clazz.getMethod("setActivity",
						new Class[] { Activity.class });
				setActionMethod.invoke(whatInstance, new Object[] { a });

			} catch (Exception e) {
				p("Error adding Activity: " + e.toString() + ", ");
			}

			loadedInterfaceDetails = new ArrayList<Object>();
			loadedInterfaceDetails.add(interfaceName);
			loadedInterfaceDetails.add(clazz);
			loadedInterfaceDetails.add(whatInstance);
			return loadedInterfaceDetails;
		} catch (Exception e) {
			p("Error while loading class: " + interfaceName + ", "
					+ e.toString());
			return null;
		}
	}

	public static boolean saveInterfacesArray(
			Map<String, String> enabledInterfaces, Context serviceOrActivity) {

		prefs = serviceOrActivity.getSharedPreferences(
				"SocialDevicesEnabledInterfaces", Context.MODE_MULTI_PROCESS);
		SharedPreferences.Editor editor = prefs.edit();
		editor.putInt(enabled_interfaces_preferences_name + "_size",
				enabledInterfaces.size());

		int i = 0;
		for (Entry<String, String> entry : enabledInterfaces.entrySet()) {
			editor.putString(enabled_interfaces_preferences_name + "_key_" + i,
					entry.getKey());
			editor.putString(enabled_interfaces_preferences_name + "_val_" + i,
					entry.getValue());
			i++;
		}
		return editor.commit();
	}

	public static Map<String, String> loadInterfacesArray(
			Context serviceOrActivity) {
		Map<String, String> retVal = new HashMap<String, String>();

		/*
		prefs = serviceOrActivity.getSharedPreferences(
				"SocialDevicesEnabledInterfaces", Context.MODE_MULTI_PROCESS);
		int size = prefs.getInt(enabled_interfaces_preferences_name + "_size",
				0);
		for (int i = 0; i < size; i++) {
			String key = prefs.getString(enabled_interfaces_preferences_name
					+ "_key_" + i, null);
			String val = prefs.getString(enabled_interfaces_preferences_name
					+ "_val_" + i, null);

			p("HH: " + key + " : " + val);
			if (!val.equals("0"))
				retVal.put(key, val);
		}
		*/
		retVal.put("TalkingDevice", "wtf");
		retVal.put("PlayerDevice", "wtf");
		
		return retVal;
	}

	public static void p(String s) {
		Log.e(CapabilityHelpers.class.getSimpleName(), s.toString());
	}

}
