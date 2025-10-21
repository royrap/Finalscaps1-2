import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class LoginPage extends StatelessWidget {
  const LoginPage({super.key});

  // 🔗 Ilagay mo dito ang iyong download link
  final String _apkDownloadUrl = 'https://l.facebook.com/l.php?u=https%3A%2F%2Fdrive.google.com%2Ffile%2Fd%2F1UnXXkU5Dw4IR53x0FMxpb3Y0GKppG8kB%2Fview%3Fusp%3Ddrivesdk%26fbclid%3DIwZXh0bgNhZW0CMTAAYnJpZBExT2RhZmU0MkhTY0JuY1RrSQEeKNKfgPynBNqKy-bCfM9b4bJaQTTAJ4d5gLDLRh4MQWdzGAX7GjLBays1fOk_aem_d4RYGJCfWM1fcvfU7zSp-Q&h=AT3Tw-1LwazXEdyzzFJQKOZhVFNh-vO0og7Y60_aSsp6Sf_7kVaZEGZ9XYh-r8UdBSJ0W4_g3BYMZoEiDhOhuXtxVQO6jFFHVGhWBz8_yv7M7382r4MkDWQ5ZIVCXj3OB_bQQxcfR7aeWdkCGZ5XTQ';

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
