
import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Movies from "@/pages/Movies";
import TVShows from "@/pages/TVShows";
import MovieDetail from "@/pages/MovieDetail";
import TVShowDetail from "@/pages/TVShowDetail";
import Search from "@/pages/Search";
import Watch from "@/pages/Watch";
import UserProfile from "@/pages/UserProfile";
import NotFound from "@/pages/NotFound";
import Layout from "@/components/Layout";
import Collections from "@/pages/Collections";
import CollectionDetail from "@/pages/CollectionDetail";

import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Index />} />
        <Route path="movies" element={<Movies />} />
        <Route path="tv" element={<TVShows />} />
        <Route path="movie/:id" element={<MovieDetail />} />
        <Route path="tv/:id" element={<TVShowDetail />} />
        <Route path="search" element={<Search />} />
        <Route path="watch/:type/:id" element={<Watch />} />
        <Route path="watch/tv/:id/:season/:episode" element={<Watch />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="collections" element={<Collections />} />
        <Route path="collection/:id" element={<CollectionDetail />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
