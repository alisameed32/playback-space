import React from 'react';

function Logo({ width = '100px' }) {
  return (
    <div className='flex items-center gap-2'>
      {/* You can replace this with an actual SVG or Image */}
      <span className="font-bold text-2xl text-purple-500">
        PlaybackSpace
      </span>
    </div>
  )
}

export default Logo;
