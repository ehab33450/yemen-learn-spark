import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, LogOut, LayoutDashboard, Trophy, Users, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const initials = user?.email?.charAt(0).toUpperCase() ?? "?";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-gold">
            <GraduationCap className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-display font-bold text-primary text-lg">نحو يمن أفضل</span>
            <span className="text-[10px] text-muted-foreground">تعلّم. تواصل. ارتقِ.</span>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/" className="text-foreground hover:text-accent transition-colors">الرئيسية</Link>
          <Link to="/tracks" className="text-muted-foreground hover:text-accent transition-colors">المسارات</Link>
          <Link to="/leaderboard" className="text-muted-foreground hover:text-accent transition-colors">لوحة الشرف</Link>
          <Link to="/about" className="text-muted-foreground hover:text-accent transition-colors">من نحن</Link>
          {user && (
            <Link to="/dashboard" className="text-muted-foreground hover:text-accent transition-colors">لوحتي</Link>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                  <LayoutDashboard className="ml-2 h-4 w-4" /> لوحتي
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/leaderboard")}>
                  <Trophy className="ml-2 h-4 w-4" /> لوحة الشرف
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/groups")}>
                  <Users className="ml-2 h-4 w-4" /> مجموعاتي
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/certificates")}>
                  <LayoutDashboard className="ml-2 h-4 w-4" /> شهاداتي
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/about")}>
                  <Info className="ml-2 h-4 w-4" /> من نحن
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="ml-2 h-4 w-4" /> تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>تسجيل الدخول</Button>
              <Button size="sm" className="bg-gradient-gold text-primary font-display font-semibold hover:opacity-90" onClick={() => navigate("/auth?mode=signup")}>
                انضم مجاناً
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};