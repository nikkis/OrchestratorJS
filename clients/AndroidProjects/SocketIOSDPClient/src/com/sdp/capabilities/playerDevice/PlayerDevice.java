package com.sdp.capabilities.playerDevice;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;
import java.net.URLConnection;
import java.security.MessageDigest;

import org.json.JSONArray;
import org.json.JSONObject;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.AsyncTask;
import android.util.Log;
import android.webkit.WebView;

public class PlayerDevice {

	public static boolean waitForVoiceFile = true;
	public static File dlVoiceFile = null;
	public static String dlVoiceUri = null;


	private static MediaPlayer mediaPlayer = null;

	public static boolean waitForBackgoundPlayback = true;
	private BackgroundSound mBackgroundSound = null;


	/*************************************************************************
	 * 	SDP stuff                                                            *
	 *************************************************************************/
	private static Context applicationContext;	
	public void setApplicationContext(Context applicationContext) {
		PlayerDevice.applicationContext = applicationContext;
	}
	/*************************************************************************/

	

	@SuppressLint("NewApi")
	public JSONObject showUrlPhoto(JSONArray JSONmethodcallParameters) throws Exception {
		
		JSONObject retVal = new JSONObject();
		try {
			
			
			String url = JSONmethodcallParameters.getString(0);
			Intent testIntent = new Intent(applicationContext, PlayerDeviceActivity.class);
			testIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
			testIntent.putExtra("url_to_show",url);
			applicationContext.startActivity(testIntent);
			
			
			p("the end");
		} catch (Exception e) {
			p(e.toString());
		}
		return retVal;
	}
	
	
	
	
	public JSONObject setLoopPlayback(JSONArray JSONmethodcallParameters) throws Exception {

		JSONObject retVal = new JSONObject();

		try {

			boolean loopPlayback = (Boolean) JSONmethodcallParameters.get(0);//getBoolean("loopPlayback");
			p("loopPlayback: " + Boolean.toString(loopPlayback));

			if(PlayerDevice.mediaPlayer != null) {
				PlayerDevice.mediaPlayer.setLooping(loopPlayback);
				p("set loopPlayback is done..");
			}


		} catch (Exception e) {
			p("Error while setting loopPlayback for mediaplayer..");
			e.printStackTrace();
		}
		return retVal;
	}
	


	public JSONObject setVolume(JSONArray JSONmethodcallParameters) throws Exception {

		JSONObject retVal = new JSONObject();

		try {

			float volumeLevel = (Float)JSONmethodcallParameters.get(0);//getDouble("volumeLevel");// .getString("volumeLevel");
			volumeLevel = volumeLevel / 10.0f;
			
			p("volumeLevel: " + Double.toString(volumeLevel));

			if(PlayerDevice.mediaPlayer != null) {
				p("inside iffi");
				PlayerDevice.mediaPlayer.setVolume(volumeLevel, volumeLevel);
				p("set is done..");
			}


		} catch (Exception e) {
			p("Error while setting volumeLevel for mediaplayer..");
			e.printStackTrace();
		}
		return retVal;
	}



	public JSONObject stopPlay(JSONArray JSONmethodcallParameters) throws Exception {

		JSONObject retVal = new JSONObject();
		if(PlayerDevice.mediaPlayer != null) {
			PlayerDevice.mediaPlayer.stop();
		}

		if(mBackgroundSound != null) {
			try {
				mBackgroundSound.cancel(true);	
			} catch (Exception e) {
				p("Error in stopPlay");
				e.printStackTrace();
			}
		}
		return retVal;
	}



	private static File downloadVoiceFile(String voiceFileURI, boolean forceReload) {

		String fileName = md5(voiceFileURI) + ".wav";

		String fullVoicePath = PlayerDevice.applicationContext.getFilesDir().getPath().toString() + "/";
		fullVoicePath += fileName;

		File file = PlayerDevice.applicationContext.getFileStreamPath(fileName);

		if(forceReload || file == null || !file.exists()) {
			p("loading file: "+voiceFileURI);
			new DownloadFileTask().execute(new String[] {fullVoicePath, voiceFileURI});

			// TIMEOUT for 10s.
			long timeout = 10000;
			long sleepTime = 100; 
			long j = 0;
			while(waitForVoiceFile && j < timeout / sleepTime) {
				//sleep(sleepTime);
				try {Thread.sleep(sleepTime);} catch (Exception e) {}
				j++;
			}

			file = PlayerDevice.applicationContext.getFileStreamPath(fileName);
			p("Download wait is over");
		}
		return file;
	}


	public JSONObject preloadFileFromURI(JSONArray JSONmethodcallParameters) throws Exception {
		p("Running preloadFileFromURI() method");
		JSONObject retVal = new JSONObject();

		try {

			// Read parameters
			String soundFileURI = (String) JSONmethodcallParameters.get(0);//getString("soundFileURI");
			p("soundFileURI: " + soundFileURI);
			Boolean forceReload = (Boolean) JSONmethodcallParameters.get(1);//getBoolean("forceReload");
			p("forceReload: " + Boolean.toString(forceReload));

			downloadVoiceFile(soundFileURI, forceReload);

		} catch (Exception e) {
			p("Error while preloading file from Uri");
			e.printStackTrace();
		}
		p("preloadFileFromURI() end");
		return retVal;
	}




	@SuppressLint("NewApi")
	public JSONObject playFileFromURI(JSONArray JSONmethodcallParameters) throws Exception {
		p("Running playFileFromURI() method");
		JSONObject retVal = new JSONObject();


		// Read parameters
		String soundFileURI = (String) JSONmethodcallParameters.get(0);//getString("soundFileURI");
		p("soundFileURI: " + soundFileURI);
		Boolean async = (Boolean) JSONmethodcallParameters.get(1);//getBoolean("async");
		p("async: " + Boolean.toString(async));



		try {

			if(async) {
				mBackgroundSound = new BackgroundSound();
				mBackgroundSound.execute(new String[] {soundFileURI, "async"});
			} else {
				playSoundFile(soundFileURI);
			}


			p("playFileFromURI() finished");
			return retVal;

		} catch (Exception e) {
			p("Error in PlayerDevice::playFileFromURI() - "+e.toString());
			return retVal;

		} finally {
			if(PlayerDevice.mediaPlayer != null) {
				PlayerDevice.mediaPlayer.reset();	
			}
		}
	}




	public static class DownloadFileTask extends AsyncTask <String,Void,Void> {

		@Override
		protected Void doInBackground(String... arg0) {

			waitForVoiceFile = true;

			try {


				String fName = arg0[0];
				p(fName);
				String urlToDownload = arg0[1];
				p(urlToDownload);

				String fullVoicePath = fName;

				URL url = new URL(urlToDownload);
				URLConnection connection = url.openConnection();
				connection.connect();

				InputStream input = new BufferedInputStream(url.openStream());
				OutputStream output = new FileOutputStream(fullVoicePath);

				byte data[] = new byte[1024];
				int count;
				while ((count = input.read(data)) != -1) {          
					output.write(data, 0, count);
				}
				output.flush();
				output.close();
				input.close();


			} catch (Exception e) {
				p("Error while downloading voice file: "+e.toString());
			}
			waitForVoiceFile = false;
			return null;
		}
	}


	private static void p(String s){
		Log.e("PlayerDevice", s.toString());
	}



	public static String md5(String s) {
		try {
			// Create MD5 Hash
			MessageDigest digest = java.security.MessageDigest.getInstance("MD5");
			digest.update(s.getBytes());
			byte messageDigest[] = digest.digest();

			// Create Hex String
			StringBuffer hexString = new StringBuffer();
			for (int i=0; i<messageDigest.length; i++)
				hexString.append(Integer.toHexString(0xFF & messageDigest[i]));
			return hexString.toString();

		} catch (Exception e) {
			p("Error in calculating MD5: "+e.toString());
		}
		return "";
	}



	@SuppressLint("NewApi")
	public static void playSoundFile(String soundFileURI) {

		try {

			if(PlayerDevice.mediaPlayer == null) {
				PlayerDevice.mediaPlayer = new MediaPlayer();	
			}
			PlayerDevice.mediaPlayer.reset();


			File file = downloadVoiceFile(soundFileURI, false);

			// Wait for file to finish
			//Thread.sleep(70);

			if (file != null && file.exists()) {
				p("file not null and did exist");
				file.setReadable(true, false);
				Uri myUri = Uri.parse(file.getAbsolutePath()); 

				for (int i = 0; i < 3; i++) {
					try {

						PlayerDevice.mediaPlayer.setAudioStreamType(AudioManager.STREAM_MUSIC);
						try {
							PlayerDevice.mediaPlayer.setDataSource(applicationContext, myUri);	
						} catch (IOException e) {
							p("second try for setDataSource");
							PlayerDevice.mediaPlayer.setDataSource(applicationContext, myUri);
						}

						PlayerDevice.mediaPlayer.prepare();
						PlayerDevice.mediaPlayer.start();
						Thread.sleep(PlayerDevice.mediaPlayer.getDuration());
						p("wait is over");

					} catch (Exception e) {
						p(e.toString());
					}
				}
			}
		} catch (Exception e) {
			p("Error in file playback");
			e.printStackTrace();
		}

	}


	public class BackgroundSound extends AsyncTask<String, Void, Void> {
		@SuppressLint("NewApi")
		@Override
		protected Void doInBackground(String... params) {
			try {

				String soundFileURI = params[0];
				playSoundFile(soundFileURI);


			} catch (Exception e) {
				e.printStackTrace();
			}
			return null;
		}
	}
	
	
}
