#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
function w(p, c) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, c);
  console.log("wrote", p);
}

// All Arabic content as unicode escapes lives in companion files.
const C = require("./content.cjs");

// ===== Navbar =====
w("src/components/site/Navbar.tsx", `import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, Menu, X, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: ${JSON.stringify(C.nav.home)} },
  { to: "/courses", label: ${JSON.stringify(C.nav.courses)} },
  { to: "/tracks", label: ${JSON.stringify(C.nav.tracks)} },
  { to: "/about