--
-- PostgreSQL database dump
--

-- Dumped from database version 16.4
-- Dumped by pg_dump version 16.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comments (
    id uuid NOT NULL,
    content text NOT NULL,
    videoid uuid,
    ownerid uuid,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.comments OWNER TO postgres;

--
-- Name: guilds; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.guilds (
    id uuid NOT NULL,
    guild_name character varying(255) NOT NULL,
    guild_description text NOT NULL,
    privacy boolean NOT NULL,
    avatar character varying(255),
    cover_image character varying(255)
);


ALTER TABLE public.guilds OWNER TO postgres;

--
-- Name: history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.history (
    id uuid,
    userid uuid,
    videoid uuid,
    created_at timestamp without time zone
);


ALTER TABLE public.history OWNER TO postgres;

--
-- Name: likes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.likes (
    userid uuid NOT NULL,
    entityid uuid NOT NULL,
    entitytype text
);


ALTER TABLE public.likes OWNER TO postgres;

--
-- Name: members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.members (
    guildid uuid NOT NULL,
    userid uuid NOT NULL,
    userrole character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.members OWNER TO postgres;

--
-- Name: replies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.replies (
    id uuid NOT NULL,
    comment_id uuid NOT NULL,
    content text NOT NULL,
    owner uuid NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.replies OWNER TO postgres;

--
-- Name: tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tags (
    name text NOT NULL
);


ALTER TABLE public.tags OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    username text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    fullname text,
    avatar text,
    cover_image text,
    dob text,
    gender text,
    google_id text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    guild uuid
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: video_urls; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.video_urls (
    id uuid NOT NULL,
    original text,
    "360" text,
    "480" text,
    "720" text
);


ALTER TABLE public.video_urls OWNER TO postgres;

--
-- Name: videos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.videos (
    id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    video text NOT NULL,
    thumbnail text,
    owner uuid NOT NULL,
    guild uuid,
    views integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    tags text[],
    duration text
);


ALTER TABLE public.videos OWNER TO postgres;

--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comments (id, content, videoid, ownerid, created_at) FROM stdin;
460813f6-4f40-4b68-a398-d1210fb3da37	vara sur baby why nor max sound dj max yoyo	fee1a427-f630-4636-8d67-91279e8aafe0	f9bb071e-19f2-4495-900c-7ca4f2afc8f2	2024-09-19 17:39:33.216572
\.


--
-- Data for Name: guilds; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.guilds (id, guild_name, guild_description, privacy, avatar, cover_image) FROM stdin;
deccefa1-76fc-4294-bacf-ccb474007b36	Demo guild	Just a demo guild	t	https://my-gametube-bucket.s3.amazonaws.com/guild/deccefa1-76fc-4294-bacf-ccb474007b36/c11e48a5-a576-4313-b8a7-8e1360767cc0.png	https://my-gametube-bucket.s3.amazonaws.com/guild/deccefa1-76fc-4294-bacf-ccb474007b36/d443acd7-dade-48fa-8a5b-a3240017ad35.png
08bb9386-a39a-44be-8ed4-63f7657ea81d	Demo guild	Just a demo guild	t	https://my-gametube-bucket.s3.amazonaws.com/guild/08bb9386-a39a-44be-8ed4-63f7657ea81d/2c8c9102-982a-4dce-adbd-279abce494c6.png	https://my-gametube-bucket.s3.amazonaws.com/guild/08bb9386-a39a-44be-8ed4-63f7657ea81d/f044384a-4d50-491f-ad26-6ea1ad74d5d7.png
ade24f33-d7be-4c3f-99fe-eae85c11ff21	Demo guild	Just a demo guild	t	https://my-gametube-bucket.s3.amazonaws.com/guild/ade24f33-d7be-4c3f-99fe-eae85c11ff21/d0029ef4-980e-4282-af3a-0567b04c32a0.png	https://my-gametube-bucket.s3.amazonaws.com/guild/ade24f33-d7be-4c3f-99fe-eae85c11ff21/eddef2e7-872c-4639-b7b0-b40a72af49d5.png
\.


--
-- Data for Name: history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.history (id, userid, videoid, created_at) FROM stdin;
19af2d34-eb7f-48db-9da5-cbed88333bb0	f9bb071e-19f2-4495-900c-7ca4f2afc8f2	fee1a427-f630-4636-8d67-91279e8aafe0	2024-09-21 14:24:20.764
9193af48-99c1-48cf-b7cc-4ec18a57da61	f9bb071e-19f2-4495-900c-7ca4f2afc8f2	fee1a427-f630-4636-8d67-91279e8aafe0	2024-09-21 14:33:01.013423
864f7f3b-e118-4c2d-bf0b-11c86e472411	f9bb071e-19f2-4495-900c-7ca4f2afc8f2	fee1a427-f630-4636-8d67-91279e8aafe0	2024-09-21 15:28:34.559904
613a1fdf-3d5b-464c-8f17-5eea15d3af6a	f9bb071e-19f2-4495-900c-7ca4f2afc8f2	fee1a427-f630-4636-8d67-91279e8aafe0	2024-09-22 13:39:39.948983
502ccebc-b913-40bf-9a7f-e125ee9070ce	f9bb071e-19f2-4495-900c-7ca4f2afc8f2	fee1a427-f630-4636-8d67-91279e8aafe0	2024-09-22 13:39:50.582005
\.


--
-- Data for Name: likes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.likes (userid, entityid, entitytype) FROM stdin;
f9bb071e-19f2-4495-900c-7ca4f2afc8f2	fee1a427-f630-4636-8d67-91279e8aafe0	video
f9bb071e-19f2-4495-900c-7ca4f2afc8f2	460813f6-4f40-4b68-a398-d1210fb3da37	comment
f9bb071e-19f2-4495-900c-7ca4f2afc8f2	3126a688-df5f-474a-bcd3-a904477f8703	reply
\.


--
-- Data for Name: members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.members (guildid, userid, userrole, created_at) FROM stdin;
ade24f33-d7be-4c3f-99fe-eae85c11ff21	f9bb071e-19f2-4495-900c-7ca4f2afc8f2	leader	2024-09-14 13:24:43.067735
6edc0bd0-8429-4192-b01e-50b185ac700d	f9bb071e-19f2-4495-900c-7ca4f2afc8f2	leader	2023-09-14 00:00:00
\.


--
-- Data for Name: replies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.replies (id, comment_id, content, owner, created_at) FROM stdin;
e2799495-3f6f-456d-a3a9-46a779505f70	4ffc986c-12bb-446d-887a-401aca1f8ff7	hello	f9bb071e-19f2-4495-900c-7ca4f2afc8f2	2024-09-10 18:41:36.355252
c8196360-89a4-43b0-8197-a746cf4ab4bd	1e8df7b7-2b2a-4e3d-a1c7-c39769aa29d6	heyy	f9bb071e-19f2-4495-900c-7ca4f2afc8f2	2024-09-10 18:42:37.674501
76c1e9a0-d426-41b8-9b5d-674abbb68946	4ffc986c-12bb-446d-887a-401aca1f8ff7	heya	f9bb071e-19f2-4495-900c-7ca4f2afc8f2	2024-09-10 18:44:02.091873
955b0516-da96-4770-b395-c3cbcff60777	4ffc986c-12bb-446d-887a-401aca1f8ff7	gg	f9bb071e-19f2-4495-900c-7ca4f2afc8f2	2024-09-10 18:47:33.758228
2ba60321-3fc5-41c2-957f-22601527155d	033e55cb-3b74-442f-9bdc-1047f0face19	yo	f9bb071e-19f2-4495-900c-7ca4f2afc8f2	2024-09-16 15:25:02.522065
3126a688-df5f-474a-bcd3-a904477f8703	460813f6-4f40-4b68-a398-d1210fb3da37	bhure bacchan ji	f9bb071e-19f2-4495-900c-7ca4f2afc8f2	2024-09-19 17:39:46.083289
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tags (name) FROM stdin;
dholak
gaming
ghost of tsushima
bhure bacchan
bhure bacchan ji
rap
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password, fullname, avatar, cover_image, dob, gender, google_id, created_at, updated_at, guild) FROM stdin;
f9bb071e-19f2-4495-900c-7ca4f2afc8f2	white_snake	white_snake35711@gmail.com	$2a$10$XtEJguLy5uqT6EAQmNtUneJrr67N5goYWIwpukAUJP5GwwQhRXF02		https://my-gametube-bucket.s3.amazonaws.com/profiles/f9bb071e-19f2-4495-900c-7ca4f2afc8f2/1ec7840a-32f3-4e08-8fcf-e0908bb992d5.webp	https://my-gametube-bucket.s3.amazonaws.com/profiles/f9bb071e-19f2-4495-900c-7ca4f2afc8f2/14843ce2-d0d5-47a9-bfcb-663afed424fc.png	2004-06-02	male	\N	2024-08-26 15:07:24.112264	2024-08-26 15:07:24.112264	ade24f33-d7be-4c3f-99fe-eae85c11ff21
c63ee745-8663-4b0e-bc30-f7772cf50baf	testuser	testuser@example.com	$2a$10$t8tijoBTrE6chd0toy6TremJ2XcDn8125QAMVGMYrR.gKY/pFgjr.	Test User	http://example.com/avatar.jpg	http://example.com/cover.jpg	\N	female		2024-08-24 15:37:23.797897	2024-08-24 15:37:23.797897	f57caa0a-cf7d-423d-8dd5-82377dd5dba3
6eabc168-015f-4c5d-9130-45dfd3ff9009	me.nikhil	nikhil@gmail.com	$2a$10$6r8Zvfyc0rR6Z/eYTs4LAec4IBEzlaL/7oMnzzY52L8LtdWjqkSjK	Nikhil Kumar	..\\uploads	..\\uploads	\N	male	\N	2024-08-25 17:13:32.779141	2024-08-25 17:13:32.779141	\N
81ff2a3a-0d20-4709-8737-b60e1797c5f3	me.nikhiil	nikhilkr@gmail.com	$2a$10$qND6WVswNGXqmMBHJVAh8..C67dx7ULMUwCGeXDO7CvW8q.mHdzfu	Nikhil Kumar	https://my-gametube-bucket.s3.amazonaws.com/uploads/ff83ac4c-ebd8-4aaf-928b-daf6bcd1f9e7	https://my-gametube-bucket.s3.amazonaws.com/uploads/e5a643d9-7287-470e-8e3b-fb30389da483	\N	male	\N	2024-08-25 17:59:25.602656	2024-08-25 17:59:25.602656	\N
a40d1616-91ba-4688-bdde-186bab2ddb16	white_snek	nikhilkr2604@gmail.com	$2a$10$OvceWNPGbd1HOU/tnd8Q2u/TZqPnezgjjjsMVO0Wa9G.z9qecSSgO	Nikhil Kumar	https://my-gametube-bucket.s3.amazonaws.com/a40d1616-91ba-4688-bdde-186bab2ddb16/fbb5da69-b798-422d-b09c-0c55378b2e75.png	https://my-gametube-bucket.s3.amazonaws.com/a40d1616-91ba-4688-bdde-186bab2ddb16/d94494bf-1504-4761-a61e-20e105b4f043.png	\N	male	\N	2024-08-25 18:12:05.604856	2024-08-25 18:12:05.604856	\N
b9b23c6a-bbf8-47ef-afe1-9304ec27691a	white_snek	nikhilkr264@gmail.com	$2a$10$zsj.LmFbIdV62fsKH2Evg.8WA3cnW/YZDFOKt0kPnBxgiYd//oxPq	Nikhil Kumar	https://my-gametube-bucket.s3.amazonaws.com/profiles/b9b23c6a-bbf8-47ef-afe1-9304ec27691a/bf2c39c2-0e2e-4d52-8d04-8248af51ff09.png	https://my-gametube-bucket.s3.amazonaws.com/profiles/b9b23c6a-bbf8-47ef-afe1-9304ec27691a/7ea9b567-f7e4-4721-a866-e250c65fd2a3.png	2004-06-02	male	\N	2024-08-26 14:54:10.261779	2024-08-26 14:54:10.261779	\N
6fb975e1-aa58-4037-af36-74e64a03d946	white_snake	white_snake@gmail.com	$2a$10$2BfeeAgJZH9bl.yw87KMQOm8SArrx0M5tcZNnfB95ZqDMIu.nJ/L6		https://my-gametube-bucket.s3.amazonaws.com/profiles/6fb975e1-aa58-4037-af36-74e64a03d946/4db64335-3406-48ac-8f1d-4512b1d477c5.webp	https://my-gametube-bucket.s3.amazonaws.com/profiles/6fb975e1-aa58-4037-af36-74e64a03d946/9836dc62-7840-47a2-a773-fc4368226a01.png	2004-06-02	male	\N	2024-08-26 15:04:11.284593	2024-08-26 15:04:11.284593	\N
\.


--
-- Data for Name: video_urls; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.video_urls (id, original, "360", "480", "720") FROM stdin;
fee1a427-f630-4636-8d67-91279e8aafe0	https://temp-gametube-videos.s3.amazonaws.com/ade24f33-d7be-4c3f-99fe-eae85c11ff21/f9bb071e-19f2-4495-900c-7ca4f2afc8f2/fee1a427-f630-4636-8d67-91279e8aafe0.mp4	https://gametube-video-transcoded.s3.amazonaws.com/ade24f33-d7be-4c3f-99fe-eae85c11ff21/f9bb071e-19f2-4495-900c-7ca4f2afc8f2/fee1a427-f630-4636-8d67-91279e8aafe0.mp4/360p/index.m3u8	https://gametube-video-transcoded.s3.amazonaws.com/ade24f33-d7be-4c3f-99fe-eae85c11ff21/f9bb071e-19f2-4495-900c-7ca4f2afc8f2/fee1a427-f630-4636-8d67-91279e8aafe0.mp4/480p/index.m3u8	https://gametube-video-transcoded.s3.amazonaws.com/ade24f33-d7be-4c3f-99fe-eae85c11ff21/f9bb071e-19f2-4495-900c-7ca4f2afc8f2/fee1a427-f630-4636-8d67-91279e8aafe0.mp4/720p/index.m3u8
\.


--
-- Data for Name: videos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.videos (id, title, description, video, thumbnail, owner, guild, views, created_at, updated_at, tags, duration) FROM stdin;
fee1a427-f630-4636-8d67-91279e8aafe0	Bhure bacchan ji	Hanji ye rap meri hi hui thi	https://temp-gametube-videos.s3.amazonaws.com/ade24f33-d7be-4c3f-99fe-eae85c11ff21/f9bb071e-19f2-4495-900c-7ca4f2afc8f2/fee1a427-f630-4636-8d67-91279e8aafe0.mp4	https://my-gametube-bucket.s3.amazonaws.com/thumbnails/fee1a427-f630-4636-8d67-91279e8aafe0/0fd3c761-6dfe-4b6b-baf8-b0bc7c8f5af8.jpg	f9bb071e-19f2-4495-900c-7ca4f2afc8f2	ade24f33-d7be-4c3f-99fe-eae85c11ff21	7	2024-09-19 17:00:08.873688	2024-09-19 17:00:08.873688	{"bhure bacchan ji",dholak,rap}	15.04
\.


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: guilds guilds_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guilds
    ADD CONSTRAINT guilds_pkey PRIMARY KEY (id);


--
-- Name: likes likes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_pkey PRIMARY KEY (userid, entityid);


--
-- Name: members members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_pkey PRIMARY KEY (guildid, userid);


--
-- Name: replies replies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.replies
    ADD CONSTRAINT replies_pkey PRIMARY KEY (id);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (name);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: video_urls video_urls_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.video_urls
    ADD CONSTRAINT video_urls_pkey PRIMARY KEY (id);


--
-- Name: videos videos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.videos
    ADD CONSTRAINT videos_pkey PRIMARY KEY (id);


--
-- Name: comments comments_ownerid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_ownerid_fkey FOREIGN KEY (ownerid) REFERENCES public.users(id);


--
-- Name: comments comments_videoid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_videoid_fkey FOREIGN KEY (videoid) REFERENCES public.videos(id);


--
-- PostgreSQL database dump complete
--

