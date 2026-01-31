import React, { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { Track } from '../types';

interface AudioPlayerProps {
    track: Track | null;
    onEnded: () => void;
}

export const AudioPlayer = forwardRef((props: AudioPlayerProps, ref) => {
    const audioRef = useRef<HTMLAudioElement>(null);

    useImperativeHandle(ref, () => ({
        play: () => {
            audioRef.current?.play();
        },
        pause: () => {
            audioRef.current?.pause();
        },
        get currentTime() {
            return audioRef.current?.currentTime;
        },
        set currentTime(time: number) {
            if (audioRef.current) {
                audioRef.current.currentTime = time;
            }
        }
    }));

    useEffect(() => {
        if (props.track && audioRef.current) {
            audioRef.current.src = props.track.url;
            audioRef.current.play();
        }
    }, [props.track]);

    return (
        <audio
            ref={audioRef}
            onEnded={props.onEnded}
            style={{ display: 'none' }}
        />
    );
});
