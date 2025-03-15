import SubscriptionList from "@/components/subscriptions";
import { VideoCards } from "@/components/video_cards";

const guilds = [
    {
        guildId: "1",
        guildAvatar: "https://w0.peakpx.com/wallpaper/41/64/HD-wallpaper-fairy-tail-guild-anime-fairy-tail-magic-manga-material-symbol-wizard-thumbnail.jpg",
        guildName: "Fairy Tail"
    },
    {
        guildId: "2",
        guildAvatar: "https://i.pinimg.com/736x/8f/36/cd/8f36cd1246762d10eb975cacafff936d.jpg",
        guildName: "Survey Corps"
    },
    {
        guildId: "3",
        guildAvatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpv9seV7n56aoMI_1npK7I9W-GbSYF8iEstA&s",
        guildName: "Tojo Clan"
    },
    {
        guildId: "4",
        guildAvatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIMqMLpnXWRUdht2a5F7hgvzOznf5c86G1ow&s",
        guildName: "Omi Alliance"
    },
    {
        guildId: "5",
        guildAvatar: "https://i.pinimg.com/736x/b1/ca/ea/b1caeabecb19c2dae8a5d59089c0ca05.jpg",
        guildName: "Akatsuki"
    },
    {
        guildId: "6",
        guildAvatar: "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/e8ddc4da-23dd-4502-b65b-378c9cfe5efa/dfgy2ns-cff22d32-bc5a-4791-839a-4d2cd2ba3af3.png/v1/fill/w_1280,h_1280/phantom_troupe_spider_5_icon_by_jormxdos_dfgy2ns-fullview.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTI4MCIsInBhdGgiOiJcL2ZcL2U4ZGRjNGRhLTIzZGQtNDUwMi1iNjViLTM3OGM5Y2ZlNWVmYVwvZGZneTJucy1jZmYyMmQzMi1iYzVhLTQ3OTEtODM5YS00ZDJjZDJiYTNhZjMucG5nIiwid2lkdGgiOiI8PTEyODAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.tontF54BMbb5RmWWM4jNqidcsyCbOfzSGwLwTdP8HDU",
        guildName: "Phantom Troupe"
    },
    {
        guildId: "7",
        guildAvatar: "https://1000logos.net/wp-content/uploads/2023/05/Straw-Hat-Logo.png",
        guildName: "Straw Hat Pirates"
    },
    {
        guildId: "8",
        guildAvatar: "https://logos-world.net/wp-content/uploads/2023/10/Black-Bulls-Logo.png",
        guildName: "Black Bulls"
    },
    {
        guildId: "9",
        guildAvatar: "https://www.pngfind.com/pngs/m/22-228392_open-bleach-gotei-13-logo-hd-png-download.png",
        guildName: "Gotei 13"
    },
    {
        guildId: "10",
        guildAvatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJqdF8RIisFKIt1El9fScNEpKQ-d8tJozYOwxUV0kCcPjQ63dlONgzzD3PJEB23pVJaYY&usqp=CAU",
        guildName: "League of Villains"
    },
    {
        guildId: "11",
        guildAvatar: "https://www.fomostore.in/cdn/shop/files/Brothers-Innovation-Stickers-Anime-UchihaClanSymbol-Image-1.jpg?v=1738334503&width=2048",
        guildName: "Uchiha Clan"
    },
    {
        guildId: "12",
        guildAvatar: "https://ih1.redbubble.net/image.952740886.2093/st,small,507x507-pad,600x600,f8f8f8.jpg",
        guildName: "Team Rocket"
    },
    {
        guildId: "13",
        guildAvatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1tcHgN3PCyfxBUQozQa9rd6zbsgXo23z4Tw&s",
        guildName: "Jujutsu High"
    }
];


export default function Subscriptions() {
  return (
    <div className="relative">
        <div className="px-10">
        <SubscriptionList guilds={guilds} />
        <h1 className="font-bold text-5xl mt-4">Latest</h1>
        </div>
        <VideoCards />
    </div>
    // 
  );
}
