import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class LoginPage extends StatelessWidget {
  const LoginPage({super.key});

  // 🔗 Ilagay mo dito ang iyong download link
  static const String _apkDownloadUrl =
'https://drive.google.com/file/d/1nrDrd9__Hw-Gbo8i_zn-WGTsAkbyF_Oy/view?usp=sharing';

  Future<void> _openDownloadLink() async {
    final Uri url = Uri.parse(_apkDownloadUrl);
    if (!await launchUrl(url, mode: LaunchMode.externalApplication)) {
      throw Exception('Could not open the download link');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // 🔐 Your existing login form widgets here...

              const SizedBox(height: 30),

              // 🧭 Download APK Button
              ElevatedButton.icon(
                onPressed: _openDownloadLink,
                icon: const Icon(Icons.download),
                label: const Text('Download APK'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blueAccent,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
