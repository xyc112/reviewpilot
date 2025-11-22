import React from 'react';
import { useParams } from 'react-router-dom';

const CourseDetail: React.FC = () => {
    const { id } = useParams();

    return (
        <div>
            <h1>课程详情页面</h1>
            <p>课程ID: {id}</p>
            <p>这里将显示课程的详细信息</p>
        </div>
    );
};

export default CourseDetail;