@@ .. @@
 -- Service role can manage all users (for admin operations)
 CREATE POLICY "Service role can manage all users"
   ON users
   FOR ALL
   TO public
-  USING (role() = 'service_role'::text);
+  USING (auth.role() = 'service_role'::text);
 
 -- Users can read their own data
 CREATE POLICY "Users can read own data"
   ON users
   FOR SELECT
   TO public
-  USING ((uid())::text = (public_id)::text);
+  USING (auth.uid()::text = public_id::text);
 
 -- Users can update their own data
 CREATE POLICY "Users can update own data"
   ON users
   FOR UPDATE
   TO public
-  USING ((uid())::text = (public_id)::text);
+  USING (auth.uid()::text = public_id::text);