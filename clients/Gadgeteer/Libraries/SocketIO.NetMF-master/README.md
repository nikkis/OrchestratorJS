SocketIO.NetMF
==============


SocketIO implementation for NetMF and .NET Gadgeteer.  
Works at least with <a href="http://nodejs.org">Node.js</a> server with <a href="http://socket.io">socket.io</a> module.

Based on jasdev55's <a href="http://jdiwebsocketclient.codeplex.com/">JDI WebSocket Client </a> and on
Matt Weimer's <a href="https://github.com/mweimer/Json.NetMF">Json.MF</a> implementation




Requirements
------------

Microsoft .NET Micro Framework 4.2 or higher.  
The example was tested with Gadgeteer Spider, wifi rs21 and button modules and <a href="http://nodejs.org">Node.js</a> server with <a href="http://socket.io">socket.io</a> module.


Example Gadgeteer application
-----------------------------

```csharp
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
            
            // after connecting, client can start emiting events, e.g. login event:
            emit("login", new ArrayList() { "my_identity_goes_here" });

            // Other emit choises are: 
            //   emit(Hashtable jsonObject); 
            //   emit(string str);

        }

        // handle your own specified event types here
        override public void onEvent(string name, ArrayList args) 
        { 
            Debug.Print("got event: " + name); 
        }


        // other reserved messages and event types
        override public void onDisconnect() { Debug.Print("disconnected"); }
        override public void onHeartbeat() { Debug.Print("got heartbeat"); }
        override public void onMessage(string message) { Debug.Print("got message: " + message); }
        override public void onJsonMessage(Hashtable jsonObject) { Debug.Print("got json obj"); }

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
```
