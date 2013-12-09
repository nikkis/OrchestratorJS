using System;
using System.Collections;
using System.Threading;
using Microsoft.SPOT;
using Microsoft.SPOT.Presentation;
using Microsoft.SPOT.Presentation.Controls;
using Microsoft.SPOT.Presentation.Media;
using Microsoft.SPOT.Touch;

using Gadgeteer.Networking;
using GT = Gadgeteer;
using GTM = Gadgeteer.Modules;
using GHI.Premium.Net;

using SocketIO.NetMF;

namespace ExampleGadgeteerSocketIOApp
{

    // TODO: add you own handlers here
    class MySocketIOClient : SocketIOClient
    {

        override public void onConnect()
        {
            Debug.Print("SocketIO connected");
            
            // after connected, client can start emiting events, e.g. login event with
            emit("login", new ArrayList() { "my_identity_goes_here" });

            // Other emit choises are: emit(Hashtable jsonObject) and emit(string str)

        }

        override public void onDisconnect() { Debug.Print("1 disconnected"); }
        override public void onHeartbeat() { Debug.Print("got heartbeat"); }
        override public void onMessage(string message) { Debug.Print("got messag: " + message); }
        override public void onJsonMessage(Hashtable jsonObject) { Debug.Print("got json object"); }
        override public void onEvent(string name, ArrayList args) { Debug.Print("got event: " + name); }

        // Handle error cases
        override public void onError(string reason) { throw new Exception(reason); }

    }



    public partial class Program
    {
        // host server details
        private static string _host = "192.168.1.66";
        private static string _port = "8080";

        // instance of socketIO client
        private MySocketIOClient socketIOClient = null;

        // WIFI details
        private static string wlanName = "wifi_ssid";
        private static string wlanPassword = "wifi_passwd";



        // This method is run when the mainboard is powered up or reset.
        void ProgramStarted()
        {

            // initializes wifi
            initWifiConnection();

            // create new socketIO client
            socketIOClient = new MySocketIOClient();

            // connect to socketIO server when button is pressed
            button.ButtonPressed += new GTM.GHIElectronics.Button.ButtonEventHandler((o, s) =>
            {
                socketIOClient.connect(_host, _port);
                Debug.Print("button pressed!");
            });


            Debug.Print("Program Started");
        }





        // Just helper to initialize WIFI connection, nothing to do with SocketIO
        void initWifiConnection()
        {
            Debug.Print("connecting to: " + wlanName);
            if (wifi.Interface.IsOpen)
            {
                Debug.Print("interface was open");
            }
            else
            {
                Debug.Print("interface was not open");
                wifi.Interface.Open();
            }
            
            wifi.Interface.WirelessConnectivityChanged += 
                new WiFiRS9110.WirelessConnectivityChangedEventHandler((s, e) => 
            {
                Debug.Print("wifi conn changed!");
                if (e.IsConnected) { Debug.Print("WIFI (" + wlanName + ") connected!"); }
                else { Debug.Print("WIFI (" + wlanName + ") disconnected.."); }
            });

            wifi.DebugPrintEnabled = true;
            wifi.UseDHCP();

            GHI.Premium.Net.WiFiNetworkInfo info = new WiFiNetworkInfo();
            info.SSID = wlanName;
            info.SecMode = GHI.Premium.Net.SecurityMode.WPA2;
            info.networkType = GHI.Premium.Net.NetworkType.AccessPoint;

            wifi.Interface.Join(info, wlanPassword);
            wifi.UseThisNetworkInterface();
        }
    }
}
