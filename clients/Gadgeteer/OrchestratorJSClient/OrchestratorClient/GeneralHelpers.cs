using System;
using Microsoft.SPOT;
using GHI.Premium.Net;

using Gadgeteer.Networking;
using GT = Gadgeteer;
using GTM = Gadgeteer.Modules;


namespace OrchestratorClient
{
    class GeneralHelpers
    {
        public static void initWifiConnection(GTM.GHIElectronics.WiFi_RS21 wifi, string wlanName, string wlanPassword)
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
