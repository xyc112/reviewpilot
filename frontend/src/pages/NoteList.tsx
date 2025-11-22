import React from 'react';
import { useParams } from 'react-router-dom';

const NoteList: React.FC = () => {
    const { id } = useParams();

    return (
        <div>
            <h1>笔记列表页面</h1>
            <p>课程ID: {id}</p>
            <p>这里将显示该课程的所有笔记</p>
        </div>
    );
};

export default NoteList;