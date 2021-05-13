# Renaming migration guide

This is a migration guide for Philter, which was recently renamed from "OCD-Cleanup".

For nitty-gritty details on how and why we renamed our project, see [issue #37](https://github.com/Loathing-Associates-Scripting-Society/philter/issues/37).

## Uninstall OCD-Cleanup and Install Philter

ℹ️ **This step is optional.**

We changed our repository URL. Fortunately, GitHub automatically redirects old URLs to new URLs, so installs and updates will continue to work. However, using the old URLs may cause unforeseen problems in the future. _Thus, we recommend following this step._

1. Enter the following commands in KoLmafia's graphical CLI to uninstall OCD-Cleanup (this won't affect your settings and rulesets):

   ```
   svn delete Loathing-Associates-Scripting-Society-OCD-Inventory-Control-trunk
   svn delete Loathing-Associates-Scripting-Society-OCD-Cleanup-trunk-release
   ```

2. Enter the following to reinstall Philter:

   ```
   svn checkout https://github.com/Loathing-Associates-Scripting-Society/philter/trunk/release
   ```

If you run into problems, please report it on our [issues board] or the [KoLmafia forum thread].

[issues board]: https://github.com/Loathing-Associates-Scripting-Society/philter/issues
[kolmafia forum thread]: https://kolmafia.us/threads/philter-the-inventory-cleanup-script.26027/
