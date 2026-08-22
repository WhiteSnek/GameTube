export interface Gif {
    id: string;
    title: string;
    images: {
        fixed_width: {
            url: string;
            width: string;
            height: string;
        };
    };
}